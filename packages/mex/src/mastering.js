const libxml = require('libxmljs2')
const R = require('ramda')
const romanize = require('romanize')
const path = require('path')
const { readFileSync } = require('fs')
const renderFormula = require('./render-formula')
const { initI18n } = require('./i18n')
const LRU = require('lru-cache')
const _ = require('lodash')
const crypto = require('crypto')

const DEFAULT_SHUFFLE_SECRET = 'tJXjzAhY3dT4B26aikG2tPmPRlWRTKXF5eVpOR2eDFz3Aj4a3FHF1jB3tswVWPhc'
const { createGradingStructure } = require('./grading-structure')

const ns = { e: 'http://ylioppilastutkinto.fi/exam.xsd' }
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'

const schemaDir = path.resolve(__dirname, '../schema')
const schema = libxml.parseXml(readFileSync(path.resolve(schemaDir, 'exam.xsd')).toString(), {
  baseUrl: schemaDir + '/'
})

function assertExamIsValid(doc) {
  if (!doc.validate(schema)) {
    // The Exam and XHTML schemas import each other, which causes libxml to add some extra warnings as error messages.
    // Filter them out, they aren't interesting.
    throw doc.validationErrors.find(err => err.level > 1)
  }

  return doc
}
/**
 * Parse an exam XML file.
 *
 * @param {string} xml
 * @returns {import("libxmljs2").Document}
 */
function parseExam(xml) {
  return libxml.parseXml(xml, { noent: false, nonet: true, noblanks: true })
}

/**
 * Master an exam.
 *
 * @param {string} xml
 * @param {(metadata?: {examCode: string, date: string, language: string, type: 'normal' | 'visually-impaired' | 'scanner'}) => Promise<string> | string} generateUuid
 * @param {(src: string, type: 'video' | 'audio' | 'image') => Promise<{ width: number, height: number } | { duration: number }>} getMediaMetadata A function that retrieves metadata (duration, width, height etc.) for media files (image, videos & audio files) used in this exam.
 * @param {boolean} lenientLaTexParsing If `false`, masterExam will throw an error if LaTeX parsing fails. Otherwise, it will return an error SVG file as a result.
 * @param {boolean} enableShuffling If `true`, all `<e:choice-answer>` and `<e:dropdown-answer>` options will be shuffled to prevent students from guessing the correct answer, unless they are marked with `ordering="fixed"`.
 * @param {string} shuffleSecret The salt used for shuffling. Should be kept secret.
 * @param {boolean} removeHiddenElements If `true`, all elements marked with `hidden="true"` will be removed.
 * @param {boolean} generateGradingStructure
 * @returns {Promise<[{ xml: string, language: string, attachments: { filename: string, restricted: boolean }[], title: string, gradingStructure: any }]>}
 */
async function masterExam(
  xml,
  generateUuid,
  getMediaMetadata,
  lenientLaTexParsing = false,
  enableShuffling = true,
  shuffleSecret = DEFAULT_SHUFFLE_SECRET,
  removeHiddenElements = true,
  generateGradingStructure = false
) {
  const doc = assertExamIsValid(parseExam(xml))
  const targetLanguages = doc.find('//e:languages/e:language/text()', ns).map(String)

  return Promise.all(
    targetLanguages.map(async language => ({
      language,
      ...(await masterExamForLanguage(
        xml,
        language,
        generateUuid,
        memoize(getMediaMetadata),
        lenientLaTexParsing,
        enableShuffling,
        shuffleSecret,
        removeHiddenElements,
        generateGradingStructure
      ))
    }))
  )
}

const createHvp = (doc, targetLanguage) => {
  const cleanString = input => input.trim().replace(/\s+/g, ' ')
  const nodeContains = (elementName, node) => {
    return node.find(`.//${elementName}`, ns).length > 0
  }

  const findQuestionTypes = node => {
    const elementNamesToTypes = {
      'fi-FI': {
        'e:scored-text-answer': 'keskitetysti arvosteltava tekstivastaus',
        'e:choice-answer': 'monivalintavastaus',
        'e:dropdown-answer': 'aukkomonivalintavastaus',
        'e:text-answer': 'tekstivastaus'
      },
      'sv-FI': {
        'e:scored-text-answer': 'centraliserat bedömt textsvar',
        'e:dropdown-answer': 'flervalslucksvar',
        'e:choice-answer': 'flervalssvar',
        'e:text-answer': 'textsvar'
      }
    }

    const elementNamesToTypesInTargetLanguage = elementNamesToTypes[targetLanguage]

    return Object.keys(elementNamesToTypesInTargetLanguage)
      .map(elementName => (nodeContains(elementName, node) ? elementNamesToTypesInTargetLanguage[elementName] : null))
      .filter(x => x !== null)
  }

  const optionsWithScoresString = function(node, optionElementName) {
    return node
      .find(`.//${optionElementName}[@score]`, ns)
      .map(o => `\t\t${cleanString(o.text())} (${o.attr('score').value()} p.)`)
      .join(', ')
  }

  const getAttributeValue = attributeName => node => node.attr(attributeName).value()
  const getMaxScore = getAttributeValue('max-score')
  const getScore = getAttributeValue('score')
  const getDisplayNumber = getAttributeValue('display-number')

  const nodeToStrings = function(node) {
    switch (node.name()) {
      case 'exam-title':
        return [cleanString(node.text())]
      case 'section': {
        const sectionTitle = cleanString(node.find('e:section-title', ns)[0].text())
        return [
          `\n\n${targetLanguage === 'sv-FI' ? 'DEL' : 'OSA'} ${getDisplayNumber(node)}: ${sectionTitle} (${getMaxScore(
            node
          )} p.)`
        ]
      }
      case 'question': {
        const answerTypesInQuestion = findQuestionTypes(node)
        const questionTitle = cleanString(node.find('e:question-title', ns)[0].text())
        return [
          `\n\t${getDisplayNumber(node)} ${questionTitle} (${getMaxScore(node)} p.) (${answerTypesInQuestion.join(
            ', '
          )})`
        ]
      }
      case 'choice-answer': {
        return [optionsWithScoresString(node, 'e:choice-answer-option')]
      }
      case 'scored-text-answer': {
        return [
          `\t${getDisplayNumber(node)}: ${node
            .find('.//e:accepted-answer[@score]', ns)
            .map(elem => `${cleanString(elem.text())} (${getScore(elem)} p.)`)
            .join(', ')}`
        ]
      }
      case 'dropdown-answer': {
        return [optionsWithScoresString(node, 'e:dropdown-answer-option')]
      }
      default:
        return []
    }
  }

  const processNode = node => {
    if (node.type() !== 'element') {
      return []
    }

    const childNodes = node.childNodes()
    return childNodes.length !== 0 ? [...nodeToStrings(node), ...childNodes.map(processNode)] : []
  }

  return R.flatten(doc.childNodes().map(processNode))
    .join('\n')
    .trim()
}

function generateHvpForLanguage(xml, targetLanguage) {
  const doc = assertExamIsValid(parseExam(xml))

  addYoCustomizations(doc, targetLanguage)
  removeLanguages(doc)
  removeComments(doc)
  applyLocalizations(doc, targetLanguage)
  addSectionNumbers(doc)
  addQuestionNumbers(doc)
  addAnswerNumbers(doc)
  updateMaxScoresToAnswers(doc)
  countMaxScores(doc)
  countSectionMaxAndMinAnswers(doc)
  return createHvp(doc, targetLanguage)
}

/**
 * Master an exam for a particular language.
 *
 * @param {string} xml
 * @param {string} targetLanguage
 * @param {(metadata?: {examCode: string, date: string, language: string, type: 'normal' | 'visually-impaired' | 'scanner'}) => Promise<string> | string} generateUuid
 * @param {(src: string, type: 'video' | 'audio' | 'image') => Promise<{ width: number, height: number } | { duration: number }>} getMediaMetadata
 * @param {boolean} lenientLaTexParsing
 * @param {boolean} enableShuffling
 * @param {string} shuffleSecret
 * @param {boolean} removeHiddenElements
 * @param {boolean} generateGradingStructure
 * @returns {Promise<{ xml: string, attachments: { filename: string, restricted: boolean }[], title: string, gradingStructure: any }>}
 */
async function masterExamForLanguage(
  xml,
  targetLanguage,
  generateUuid,
  getMediaMetadata,
  lenientLaTexParsing = false,
  enableShuffling = true,
  shuffleSecret = DEFAULT_SHUFFLE_SECRET,
  removeHiddenElements = true,
  generateGradingStructure = false
) {
  const doc = assertExamIsValid(parseExam(xml))

  await addExamUuid(doc, generateUuid, targetLanguage)
  removeLanguages(doc)
  removeComments(doc)
  if (removeHiddenElements) doRemoveHiddenElements(doc)
  applyLocalizations(doc, targetLanguage)
  addYoCustomizations(doc, targetLanguage)
  addSectionNumbers(doc)
  addQuestionNumbers(doc)
  addAnswerNumbers(doc)
  addQuestionIds(doc)
  if (enableShuffling) {
    shuffleAnswerOptions(doc, shuffleSecret)
  }
  addAttachmentNumbers(doc)
  updateMaxScoresToAnswers(doc)
  countMaxScores(doc)
  countSectionMaxAndMinAnswers(doc)
  addAnswerOptionIds(doc)
  addRestrictedAudioMetadata(doc)
  await renderFormulas(doc, lenientLaTexParsing)
  await addMediaMetadata(doc, memoize(getMediaMetadata))

  const examTitle = doc.get('//e:exam-title', ns)
  const gradingStructure = generateGradingStructure ? createGradingStructure(doc, targetLanguage) : undefined

  removeCorrectAnswers(doc)

  return {
    xml: doc.toString(false),
    attachments: collectAttachments(doc),
    title: examTitle && examTitle.text().trim(),
    gradingStructure
  }
}

async function addMediaMetadata(doc, getMediaMetadata) {
  for (const attachment of doc.find('//e:image | //e:video | //e:audio | //e:audio-test', ns)) {
    const name = attachment.name()
    const type = name === 'audio-test' ? 'audio' : name
    const metadata = await getMediaMetadata(getAttr('src', attachment), type)
    if (type === 'image' || type === 'video') {
      attachment.attr('width', metadata.width)
      attachment.attr('height', metadata.height)
    } else if (type === 'audio') {
      attachment.attr('duration', metadata.duration)
    }
  }
}

function collectAttachments(doc) {
  const mkAttachment = (filename, restricted = false) => ({ filename, restricted })

  const attachments = doc
    .find(attachmentTypesXPath, ns)
    .map(element => mkAttachment(getAttr('src', element), getAttr('times', element) != null))
  const maybeCustomStylesheet = getAttr('exam-stylesheet', doc.root())

  return R.uniq([...attachments, ...(maybeCustomStylesheet ? [mkAttachment(maybeCustomStylesheet)] : [])])
}

async function addExamUuid(doc, generateUuid, language) {
  const exam = doc.root()
  const examCode = getAttr('exam-code', exam)
  const date = getAttr('date', exam)
  const metadata = examCode != null && date != null ? { examCode, date, language, type: 'normal' } : undefined
  const examUuid = await generateUuid(metadata)
  doc.root().attr('exam-uuid', examUuid)
}

function addYoCustomizations(doc, targetLanguage) {
  const root = doc.root()
  const examCode = getAttr('exam-code', root)

  if (!examCode) return

  const i18n = initI18n(targetLanguage)
  const dayCode = getAttr('day-code', root)
  const key = dayCode ? examCode + '_' + dayCode : examCode

  const examTitle = doc.get('//e:exam-title', ns)
  if (!examTitle) {
    const title = i18n.t(key, { ns: 'exam-title' })
    if (title) {
      root.child(0).addPrevSibling(root.node('exam-title', title).namespace(ns.e))
    }
  }

  const examFooter = doc.get('//e:exam-footer', ns)
  if (!examFooter) {
    const footerText = i18n.t([key, 'default'], { ns: 'exam-footer' })
    root
      .node('exam-footer')
      .namespace(ns.e)
      .node('p', footerText)
      .attr('class', 'e-text-center e-semibold')
  }
}

function removeLanguages(doc) {
  doc.find('//e:languages', ns).forEach(e => e.remove())
}

function removeComments(doc) {
  doc.find('//comment()').forEach(e => e.remove())
}

function doRemoveHiddenElements(doc) {
  doc.find('//e:*[@hidden=true()]', ns).forEach(e => e.remove())
}

function updateMaxScoresToAnswers(doc) {
  function findMaxScoreToAnswer(doc) {
    doc.find('//e:choice-answer | //e:dropdown-answer | //e:scored-text-answer', ns).forEach(answer => {
      // if answer already has max-score defined, let's not override it
      if (!answer.attr('max-score')) {
        const maxScore = R.pipe(
          R.map(numAttr('score')),
          R.reduce(R.max, 0)
        )(answer.find('./e:choice-answer-option | ./e:dropdown-answer-option | ./e:accepted-answer', ns))
        answer.attr('max-score', maxScore)
      }
    })
  }

  findMaxScoreToAnswer(doc)
}

function removeCorrectAnswers(doc) {
  function removeScoreFromOptions(doc) {
    doc.find('//e:choice-answer-option | //e:dropdown-answer-option', ns).forEach(option => {
      const attr = option.attr('score')
      if (attr) attr.remove()
    })
  }

  function removeAcceptedAnswers(doc) {
    doc.find('//e:accepted-answer', ns).forEach(acceptedAnswer => acceptedAnswer.remove())
  }

  removeScoreFromOptions(doc)
  removeAcceptedAnswers(doc)
}

function applyLocalizations(doc, targetLanguage) {
  doc.find('//e:localization', ns).forEach(localization => {
    if (getAttr('lang', localization) === targetLanguage) replaceElementWithChildNodes(localization)
    else localization.remove()
  })
  doc.find(`//e:*[@lang and @lang!='${targetLanguage}']`, ns).forEach(element => element.remove())
}

function addSectionNumbers(doc) {
  doc.find('//e:section', ns).forEach((section, i) => section.attr('display-number', romanize(i + 1)))
}

function addQuestionNumbers(doc, level = 0, prefix = '') {
  doc.find(`.//e:question[count(ancestor::e:question) = ${level}]`, ns).forEach((question, i) => {
    const displayNumber = prefix + (i + 1) + '.'
    question.attr('display-number', displayNumber)
    addQuestionNumbers(question, level + 1, displayNumber)
  })
}

function addAnswerNumbers(doc) {
  doc.find('//e:question', ns).forEach(question => {
    questionAnswers(question).forEach((answer, i) => {
      answer.attr('display-number', String(i + 1))
    })
  })
}

function addAttachmentNumbers(doc) {
  // Exam-specific external material
  doc.find('./e:external-material/e:attachment', ns).forEach((attachment, i) => {
    attachment.attr('display-number', alphabet[i])
  })

  // Question external-material
  doc.find('//e:question', ns).forEach(question => {
    const questionDisplayNumber = getAttr('display-number', question)
    question
      // Only number external attachments for now, since you can't refer to internal
      // attachments. This also makes the numbering less confusing for users,
      // since it will always start at "A".
      .find('./e:external-material/e:attachment', ns)
      .forEach((attachment, i) => {
        const displayNumber = questionDisplayNumber + ' ' + alphabet[i]
        attachment.attr('display-number', displayNumber)
      })
  })
}

function addQuestionIds(doc) {
  doc.find(answerTypesXPath, ns).forEach((answer, i) => {
    answer.attr('question-id', i + 1)
  })
}

function countSectionMaxAndMinAnswers(doc) {
  const examMaxAnswers = numAttr('max-answers', doc.root())
  if (!examMaxAnswers) return
  const sections = doc.find('//e:section', ns)

  sections.forEach(section => {
    if (!numAttr('max-answers', section)) {
      section.attr('max-answers', Math.min(section.find('./e:question', ns).length, examMaxAnswers))
    }
  })

  sections.forEach(section => {
    const maxAnswers = numAttr('max-answers', section)
    const otherSectionMaxAnswers = R.sum(sections.filter(s => s !== section).map(numAttr('max-answers')))
    const minAnswers = R.clamp(0, maxAnswers, examMaxAnswers - otherSectionMaxAnswers)
    section.attr('min-answers', minAnswers)
  })
}

function countMaxScores(doc) {
  function countMaxScore(answerables, maxAnswers) {
    return R.pipe(
      R.map(numAttr('max-score')),
      R.sort(R.comparator(R.gt)),
      R.take(maxAnswers || answerables.length),
      R.sum
    )(answerables)
  }

  function countQuestionMaxScores(element = doc, level = 0) {
    element.find(`.//e:question[count(ancestor::e:question) = ${level}]`, ns).forEach(question => {
      countQuestionMaxScores(element, level + 1)
      const maxAnswers = numAttr('max-answers', question)
      const answers = questionAnswers(question)
      const answerables =
        answers.length > 0 ? answers : question.find(`.//e:question[ancestor::e:question[1][self::*]]`, ns)
      const maxScore = countMaxScore(answerables, maxAnswers)
      question.attr('max-score', maxScore)
    })
  }

  function countSectionMaxScores() {
    doc.find('//e:section', ns).forEach(section => {
      const maxAnswers = numAttr('max-answers', section)
      const questions = section.find('./e:question', ns)
      const maxScore = countMaxScore(questions, maxAnswers)
      section.attr('max-score', maxScore)
    })
  }

  function countExamMaxScore() {
    const exam = doc.root()
    const examMaxAnswers = numAttr('max-answers', exam)
    const sections = exam.find('./e:section', ns)
    const questionsWithHighestMaxScoresPerSection = R.chain(section => {
      const sectionMaxAnswers = numAttr('max-answers', section)
      const questions = section.find('./e:question', ns)
      return R.pipe(
        R.sortWith([R.descend(numAttr('max-score'))]),
        R.take(sectionMaxAnswers || questions.length)
      )(questions)
    }, sections)
    const maxScore = countMaxScore(questionsWithHighestMaxScoresPerSection, examMaxAnswers)
    exam.attr('max-score', maxScore)
  }

  countQuestionMaxScores()
  countSectionMaxScores()
  countExamMaxScore()
}

function addAnswerOptionIds(doc) {
  doc.find('//e:choice-answer | //e:dropdown-answer', ns).forEach(answer => {
    answer.find('./e:choice-answer-option | ./e:dropdown-answer-option', ns).forEach((answerOption, i) => {
      answerOption.attr('option-id', i + 1)
    })
  })
}

function addRestrictedAudioMetadata(doc) {
  doc.find('//e:audio[@times]', ns).forEach((audio, i) => audio.attr('restricted-audio-id', i))
}

function shuffleAnswerOptions(doc, secret) {
  const createHash = value => {
    const hash = crypto.createHash('sha256')
    hash.update(value)
    return hash.digest('hex')
  }

  doc.find('(//e:choice-answer | //e:dropdown-answer)[not(@ordering="fixed")]', ns).forEach(answer => {
    const options = answer.find('./e:choice-answer-option | ./e:dropdown-answer-option', ns)
    const answerKey = String(options.length) + getAttr('question-id', answer)
    const sortedOptions = R.sortBy(option => createHash(answerKey + options.indexOf(option) + secret), options)
    for (const option of sortedOptions) {
      answer.addChild(option)
    }
  })
}

async function renderFormulas(doc, lenientLaTexParsing) {
  for (const formula of doc.find('//e:formula', ns)) {
    try {
      const { svg, mml } = await renderFormulaCached(formula.text(), getAttr('mode', formula), lenientLaTexParsing)
      formula.attr('svg', svg)
      formula.attr('mml', mml)
    } catch (errors) {
      const error = new Error(errors.join(', '))
      // Masquerade as an libxmljs error, so we can show the offending source to the user.
      error.domain = 999
      error.line = formula.line()
      error.column = 0
      throw error
    }
  }
}

const answerTypesXPath = ['text-answer', 'scored-text-answer', 'choice-answer', 'dropdown-answer']
  .map(R.concat('.//e:'))
  .join(' | ')

const attachmentTypesXPath = ['image', 'video', 'file', 'audio', 'audio-test'].map(R.concat('.//e:')).join(' | ')

function questionAnswers(question) {
  return question.find(`(${answerTypesXPath})[ancestor::e:question[1][self::*]]`, ns)
}

const getAttr = R.curry((name, element) => {
  const maybeAttr = element.attr(name)
  if (maybeAttr) return maybeAttr.value()
})

const numAttr = R.curry((name, element) => {
  const maybeVal = getAttr(name, element)
  if (maybeVal) return Number(maybeVal)
})

function replaceElementWithChildNodes(element) {
  for (const childNode of element.childNodes()) {
    element.addPrevSibling(childNode)
  }

  element.remove()
}

function wrapInLruCache(asyncFn, keyFn = (...args) => args.join(), cacheOptions = { max: 50, maxAge: 1000 * 120 }) {
  const cache = new LRU(cacheOptions)
  return async function wrappedInLRU(...args) {
    const key = keyFn(...args)
    const maybeValue = cache.get(key)
    if (maybeValue !== undefined) {
      return maybeValue
    } else {
      const value = await asyncFn(...args)
      cache.set(key, value)
      return value
    }
  }
}

const memoize = fn => _.memoize(fn, (...args) => args.join())

const renderFormulaCached = wrapInLruCache(renderFormula)

module.exports = {
  parseExam,
  masterExam,
  masterExamForLanguage,
  generateHvpForLanguage
}
