import crypto from 'crypto'
import { readFileSync } from 'fs'
import * as libxml from 'libxmljs2'
import { Document, Element, Namespace, SyntaxError } from 'libxmljs2'
import _ from 'lodash'
import path from 'path'
import { toRoman } from 'roman-numerals'
import { initI18n } from '../i18n'
import { createGradingStructure, GradingStructure } from './createGradingStructure'
import { createHvp } from './createHvp'
import renderFormula from './render-formula'
import { answerTypes, attachmentTypes, choiceAnswerTypes, ns } from './schema'
import {
  asElements,
  byAttribute,
  byLocalName as byName,
  getAttribute,
  getNumericAttribute,
  hasAttribute,
  queryAncestors,
  xpathOr
} from './utils'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'

const schemaDir = path.resolve(__dirname, '../../schema')
const schema = libxml.parseXml(readFileSync(path.resolve(schemaDir, 'exam.xsd')).toString(), {
  baseUrl: schemaDir + '/'
} as any) // FIXME: Missing baseUrl in the libxmljs2 typings

interface VideoMetadata {
  width: number
  height: number
}
interface ImageMetadata {
  width: number
  height: number
}
interface AudioMetadata {
  duration: number
}

export type GenerateUuid = (metadata?: {
  examCode: string
  date: string
  language: string
  type: 'normal' | 'visually-impaired' | 'scanner'
}) => Promise<string> | string

// TODO: Try to figure out a way to make this overloading be typed more accurately.
export type GetMediaMetadata = (
  src: string,
  type: 'image' | 'video' | 'audio'
) => Promise<ImageMetadata | VideoMetadata | AudioMetadata>

interface MasteringOptions {
  /**
   * A secret salt-like value used in shuffling multi choice answers
   * deterministically. This value should be kept secret, otherwise an attacker
   * could reverse engineer the original order of <e:choice-answer-option>` or
   * `<e:dropdown-answer-option>` elements.
   *
   * If set to `undefined`, multichoice answers will not be shuffled.
   */
  multiChoiceShuffleSecret?: string
  /**
   * Remove elements with the `hidden` attribute set to `true` from the mastered
   * XML.
   */
  removeHiddenElements?: boolean
  /**
   * Throws an error if encountering an invalid LaTeX formula in an
   * `<e:formula>…</e:formula>` element.
   */
  throwOnLatexError?: boolean
}

const defaultOptions = {
  multiChoiceShuffleSecret: 'tJXjzAhY3dT4B26aikG2tPmPRlWRTKXF5eVpOR2eDFz3Aj4a3FHF1jB3tswVWPhc',
  removeHiddenElements: true,
  throwOnLatexError: true
}

function assertExamIsValid(doc: Document): Document {
  if (!doc.validate(schema)) {
    // The Exam and XHTML schemas import each other, which causes libxml to add some extra warnings as error messages.
    // Filter them out, they aren't interesting.
    throw doc.validationErrors.find(err => err.level! > 1)
  }

  const root = doc.root()!

  for (const answer of asElements(root.find(xpathOr(answerTypes), ns))) {
    // Ensure that the each answer element is directly within a question,
    // ignoring a few special HTML-like exam elements.
    const htmlLikeExamElements = ['scored-text-answers', 'localization', 'attachment']
    const maybeParentQuestion = queryAncestors(
      answer,
      e => e.namespace()?.href() === ns.e && !htmlLikeExamElements.includes(e.name())
    )

    if (maybeParentQuestion?.name() !== 'question') {
      throw mkError('All answers must be within a question.', answer)
    }

    // Ensure that the question containing the answer doesn't have any child questions.
    const maybeChildQuestion = maybeParentQuestion.get('.//e:question', ns)
    if (maybeChildQuestion != null) {
      throw mkError('A question may not contain both answer elements and child questions', maybeChildQuestion)
    }
  }

  return doc
}
/**
 * Parse an exam XML file. This should be the only function used for parsing
 * exam XML files, since it sets libxmljs2 options that are necessary for
 * security purposes.
 */
export function parseExam(xml: string) {
  return libxml.parseXml(xml, { noent: false, nonet: true, noblanks: true })
}

export interface Attachment {
  filename: string
  restricted: boolean
}

export interface MasteringResult {
  /** The attachments used by this exam version. */
  attachments: Attachment[]
  /** The date of the exam. */
  date: string | null
  /** The optional day code of the exam. Only used in YO exams. */
  dayCode: string | null
  /** The optional exam code of the exam. Only used in YO exams. */
  examCode: string | null
  /** An UUID that uniquely identifies this exam version. */
  examUuid: string
  /** The data structure used by Abitti to grade this exam version. */
  gradingStructure: GradingStructure
  /** Hyvän vastauksen piirteet for this exam. Only used in YO exams. */
  hvp: string
  /** The language of this exam version. Defined in the `<e:languages>` element of the XML. */
  language: string
  /** The optional title of this exam */
  title: string | null
  /** The mastered XML. */
  xml: string
}

/**
 * Master an exam.
 */
export async function masterExam(
  xml: string,
  generateUuid: GenerateUuid,
  getMediaMetadata: GetMediaMetadata,
  options?: MasteringOptions
): Promise<MasteringResult[]> {
  const doc = assertExamIsValid(parseExam(xml))
  const languages = doc
    .root()!
    .find('//e:languages/e:language/text()', ns)
    .map(String)
  const memoizedGetMediaMetadata = _.memoize(getMediaMetadata, _.join)
  const optionsWithDefaults = { ...defaultOptions, ...options }

  return Promise.all(
    languages.map(language =>
      masterExamForLanguage(parseExam(xml), language, generateUuid, memoizedGetMediaMetadata, optionsWithDefaults)
    )
  )
}

async function masterExamForLanguage(
  doc: Document,
  language: string,
  generateUuid: GenerateUuid,
  getMediaMetadata: GetMediaMetadata,
  options: MasteringOptions
): Promise<MasteringResult> {
  const exam = doc.root()!

  await addExamUuid(exam, generateUuid, language)
  applyLocalizations(exam, language)

  const sections = asElements(exam.find('//e:section', ns))
  const questions = asElements(exam.find('//e:question', ns))
  const answers = asElements(exam.find(xpathOr(answerTypes), ns))
  const attachments = asElements(exam.find(xpathOr(attachmentTypes), ns))

  addYoCustomizations(exam, language)
  addSectionNumbers(sections)
  addQuestionNumbers(exam)
  addAnswerNumbers(questions)
  addQuestionIds(answers)
  if (options.multiChoiceShuffleSecret) {
    shuffleAnswerOptions(answers, options.multiChoiceShuffleSecret)
  }
  addAttachmentNumbers(exam, questions)
  updateMaxScoresToAnswers(answers)
  countMaxScores(exam, sections)
  countSectionMaxAndMinAnswers(exam, sections)
  addAnswerOptionIds(answers)
  addRestrictedAudioMetadata(attachments)
  await renderFormulas(exam, options.throwOnLatexError)
  await addMediaMetadata(attachments, getMediaMetadata)

  const gradingStructure = createGradingStructure(answers)
  const hvp = createHvp(doc, language)

  removeComments(exam)
  removeCorrectAnswers(answers)
  if (options.removeHiddenElements) {
    removeHiddenElements(exam)
  }

  return {
    attachments: collectAttachments(exam, attachments),
    date: getAttribute('date', exam, null),
    dayCode: getAttribute('day-code', exam, null),
    examCode: getAttribute('exam-code', exam, null),
    examUuid: getAttribute('exam-uuid', exam),
    gradingStructure,
    hvp,
    language,
    title:
      exam
        .get('//e:exam-title', ns)
        ?.text()
        .trim() ?? null,
    xml: doc.toString(false)
  }
}

async function addMediaMetadata(attachments: Element[], getMediaMetadata: GetMediaMetadata) {
  for (const attachment of attachments) {
    const name = attachment.name()
    if (name === 'audio' || name === 'video' || name === 'image' || name === 'audio-test') {
      const type = name === 'audio-test' ? 'audio' : name
      const metadata = await getMediaMetadata(getAttribute('src', attachment), type)
      if (type === 'audio') {
        const audioMetadata = metadata as AudioMetadata
        attachment.attr('duration', String(audioMetadata.duration))
      } else {
        const imageOrVideoMetadata = metadata as ImageMetadata | VideoMetadata
        attachment.attr('width', String(imageOrVideoMetadata.width))
        attachment.attr('height', String(imageOrVideoMetadata.height))
      }
    }
  }
}

function collectAttachments(exam: Element, attachments: Element[]): Attachment[] {
  const mkAttachment = (filename: string, restricted = false): Attachment => ({ filename, restricted })
  const maybeCustomStylesheet = getAttribute('exam-stylesheet', exam, null)

  return _.uniqWith(
    [
      ...attachments.map(a => mkAttachment(getAttribute('src', a), a.attr('times') != null)),
      ...(maybeCustomStylesheet ? [mkAttachment(maybeCustomStylesheet)] : [])
    ],
    _.isEqual
  )
}

async function addExamUuid(exam: Element, generateUuid: GenerateUuid, language: string) {
  const examCode = getAttribute('exam-code', exam, null)
  const date = getAttribute('date', exam, null)
  const metadata = examCode != null && date != null ? { examCode, date, language, type: 'normal' as const } : undefined
  const examUuid = await generateUuid(metadata)
  exam.attr('exam-uuid', examUuid)
}

function addYoCustomizations(exam: Element, language: string) {
  const examCode = getAttribute('exam-code', exam, null)

  if (!examCode) {
    return
  }

  const i18n = initI18n(language)
  const dayCode = getAttribute('day-code', exam, null)
  const key = dayCode ? examCode + '_' + dayCode : examCode

  const examTitle = exam.get('//e:exam-title', ns)
  if (!examTitle) {
    const title = i18n.t(key, { ns: 'exam-title' })
    if (title) {
      const firstChild = exam.child(0) as Element
      firstChild.addPrevSibling(exam.node('exam-title', title).namespace((ns.e as any) as Namespace)) // TODO: Remove cast when libxmljs2 typings are fixed.
    }
  }

  const examFooter = exam.get('//e:exam-footer', ns)
  if (!examFooter) {
    const footerText = i18n.t([key, 'default'], { ns: 'exam-footer' })
    exam
      .node('exam-footer')
      .namespace((ns.e as any) as Namespace) // TODO: Remove cast when libxmljs2 typings are fixed
      .node('p', footerText)
      .attr('class', 'e-text-center e-semibold')
  }
}

function removeComments(exam: Element) {
  exam.find('//comment()').forEach(e => e.remove())
}

function removeHiddenElements(exam: Element) {
  exam.find('//e:*[@hidden=true()]', ns).forEach(e => e.remove())
}

function updateMaxScoresToAnswers(answers: Element[]) {
  for (const answer of answers) {
    switch (answer.name()) {
      case 'choice-answer':
      case 'dropdown-answer':
      case 'scored-text-answer': {
        if (answer.attr('max-score') == null) {
          const scores = asElements(
            answer.find('./e:choice-answer-option | ./e:dropdown-answer-option | ./e:accepted-answer', ns)
          ).map(option => getNumericAttribute('score', option, 0))
          const maxScore = _.max(scores)
          answer.attr('max-score', String(maxScore || 0))
        }
      }
    }
  }
}

function removeCorrectAnswers(answers: Element[]) {
  for (const answer of answers) {
    switch (answer.name()) {
      case 'choice-answer':
      case 'dropdown-answer':
        {
          for (const option of asElements(answer.find('//e:choice-answer-option | //e:dropdown-answer-option', ns))) {
            option.attr('score')?.remove()
          }
        }
        break
      case 'scored-text-answer': {
        answer.find('.//e:accepted-answer', ns).forEach(e => e.remove())
      }
    }
  }
}

function applyLocalizations(exam: Element, language: string) {
  exam.find('.//e:languages', ns).forEach(e => e.remove())

  for (const localization of asElements(exam.find('//e:localization', ns))) {
    if (getAttribute('lang', localization) === language) {
      for (const childNode of localization.childNodes()) {
        localization.addPrevSibling(childNode)
      }
    }
    localization.remove()
  }

  exam.find(`//e:*[@lang and @lang!='${language}']`, ns).forEach(element => element.remove())
}

function addSectionNumbers(sections: Element[]) {
  sections.forEach((section, i) => section.attr('display-number', toRoman(i + 1)))
}

function addQuestionNumbers(element: Element, level = 0, prefix = '') {
  asElements(element.find(`.//e:question[count(ancestor::e:question) = ${level}]`, ns)).forEach((question, i) => {
    const displayNumber = prefix + (i + 1) + '.'
    question.attr('display-number', displayNumber)
    addQuestionNumbers(question, level + 1, displayNumber)
  })
}

function addAnswerNumbers(questions: Element[]) {
  for (const question of questions) {
    const questionNumber = getAttribute('display-number', question)
    questionAnswers(question).forEach((answer, i, answers) => {
      answer.attr('display-number', answers.length === 1 ? questionNumber : `${questionNumber}${i + 1}.`)
    })
  }
}

function addAttachmentNumbers(exam: Element, questions: Element[]) {
  // Exam-specific external material
  asElements(exam.find('./e:external-material/e:attachment', ns)).forEach((attachment, i) => {
    attachment.attr('display-number', alphabet[i])
  })

  // Question external-material
  for (const question of questions) {
    const questionDisplayNumber = getAttribute('display-number', question)!
    // Only number external attachments for now, since you can't refer to internal
    // attachments. This also makes the numbering less confusing for users,
    // since it will always start at "A".
    asElements(question.find('./e:external-material/e:attachment', ns)).forEach((attachment, i) => {
      const displayNumber = questionDisplayNumber + ' ' + alphabet[i]
      attachment.attr('display-number', String(displayNumber))
    })
  }
}

function addQuestionIds(answers: Element[]) {
  answers.forEach((answer, i) => {
    answer.attr('question-id', String(i + 1))
  })
}

function countSectionMaxAndMinAnswers(exam: Element, sections: Element[]) {
  const examMaxAnswers = getNumericAttribute('max-answers', exam, null)
  if (!examMaxAnswers) {
    return
  }

  for (const section of sections) {
    if (getNumericAttribute('max-answers', section, null) == null) {
      section.attr('max-answers', String(Math.min(section.find('./e:question', ns).length, examMaxAnswers)))
    }
  }

  for (const section of sections) {
    const maxAnswers = getNumericAttribute('max-answers', section)
    const otherSectionMaxAnswers = _.sumBy(
      sections.filter(s => s !== section),
      otherSection => getNumericAttribute('max-answers', otherSection)
    )
    const minAnswers = _.clamp(maxAnswers, 0, examMaxAnswers - otherSectionMaxAnswers)
    section.attr('min-answers', String(minAnswers))
  }
}

function countMaxScores(exam: Element, sections: Element[]) {
  function countMaxScore(answerables: Element[], maxAnswers: number | null) {
    const maxScores = answerables.map(a => getNumericAttribute('max-score', a))
    return _.sum(_.take(_.orderBy(maxScores, _.identity, 'desc'), maxAnswers ?? answerables.length))
  }

  function countQuestionMaxScores(element = exam, level = 0) {
    for (const question of asElements(element.find(`.//e:question[count(ancestor::e:question) = ${level}]`, ns))) {
      countQuestionMaxScores(element, level + 1)
      const maxAnswers = getNumericAttribute('max-answers', question, null)
      const answers = questionAnswers(question)
      const answerables =
        answers.length > 0 ? answers : asElements(question.find(`.//e:question[ancestor::e:question[1][self::*]]`, ns))
      const maxScore = countMaxScore(answerables, maxAnswers)
      question.attr('max-score', String(maxScore ?? 0))
    }
  }

  function countSectionMaxScores() {
    for (const section of sections) {
      const maxAnswers = getNumericAttribute('max-answers', section, null)
      const questions = asElements(section.find('./e:question', ns))
      const maxScore = countMaxScore(questions, maxAnswers)
      section.attr('max-score', String(maxScore ?? 0))
    }
  }

  function countExamMaxScore() {
    const examMaxAnswers = getNumericAttribute('max-answers', exam, null)
    const questionsWithHighestMaxScoresPerSection = _.flatMap(sections, section => {
      const sectionMaxAnswers = getNumericAttribute('max-answers', section, null)
      const questions = asElements(section.find('./e:question', ns))
      return _.take(
        _.orderBy(questions, question => getNumericAttribute('max-score', question), 'desc'),
        sectionMaxAnswers ?? questions.length
      )
    })
    const maxScore = countMaxScore(questionsWithHighestMaxScoresPerSection, examMaxAnswers)
    exam.attr('max-score', String(maxScore ?? 0))
  }

  countQuestionMaxScores()
  countSectionMaxScores()
  countExamMaxScore()
}

function addAnswerOptionIds(answers: Element[]) {
  answers.filter(byName(...choiceAnswerTypes)).forEach(choiceAnswer =>
    asElements(choiceAnswer.find('./e:choice-answer-option | ./e:dropdown-answer-option', ns)).forEach(
      (answerOption, i) => {
        answerOption.attr('option-id', String(i + 1))
      }
    )
  )
}

function addRestrictedAudioMetadata(attachments: Element[]) {
  attachments
    .filter(byName('audio'))
    .filter(hasAttribute('times'))
    .forEach((audio, i) => audio.attr('restricted-audio-id', String(i)))
}

function shuffleAnswerOptions(answers: Element[], multichoiceShuffleSecret: string) {
  const createHash = (value: string) => {
    const hash = crypto.createHash('sha256')
    hash.update(value)
    return hash.digest('hex')
  }
  return answers
    .filter(byName(...choiceAnswerTypes))
    .filter(_.negate(byAttribute('ordering', 'fixed')))
    .forEach(answer => {
      const options = asElements(answer.find('./e:choice-answer-option | ./e:dropdown-answer-option', ns))
      const answerKey = String(options.length) + getAttribute('question-id', answer)
      const sortedOptions = _.sortBy(options, option =>
        createHash(answerKey + options.indexOf(option) + multichoiceShuffleSecret)
      )
      for (const option of sortedOptions) {
        answer.addChild(option)
      }
    })
}

async function renderFormulas(exam: Element, throwOnLatexError?: boolean) {
  for (const formula of asElements(exam.find('//e:formula', ns))) {
    try {
      const { svg, mml } = await renderFormula(formula.text(), getAttribute('mode', formula, null), throwOnLatexError)
      formula.attr('svg', svg)
      formula.attr('mml', mml)
    } catch (errors) {
      throw mkError(errors.join(', '), formula)
    }
  }
}

/** Creates an error object with line number information. */
function mkError(message: string, element: Element): SyntaxError {
  const err = (new Error(message) as any) as SyntaxError
  err.domain = 999
  err.line = (element as any).line() // FIXME: libxmljs2 typings don't define `element.line()` right now.
  err.column = 0
  return err
}

function questionAnswers(question: Element): Element[] {
  return asElements(question.find(`${xpathOr(answerTypes)}[ancestor::e:question[1][self::*]]`, ns))
}
