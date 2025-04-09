import * as libxml from 'libxmljs2'

export type Language = 'fi-FI' | 'sv-FI'

export interface ExamVersion {
  language: Language
  type?: 'normal' | 'visually-impaired' | 'hearing-impaired'
}

export interface GenerateExamOptions {
  date?: string
  examCode?: string
  dayCode?: string
  maxAnswers?: number
  examVersions?: ExamVersion[]
  sections: GenerateSectionOptions[]
}

export interface GenerateSectionOptions {
  maxAnswers?: number
  casForbidden?: boolean
  type?: string
  questions: GenerateQuestionOptions[]
}

export interface GenerateParentQuestionOptions {
  maxAnswers?: number
  questions: GenerateQuestionOptions[]
}

export interface GenerateSubQuestionOptions {
  maxAnswers?: number
  answers: GenerateAnswerOptions[]
}

export type GenerateQuestionOptions = GenerateParentQuestionOptions | GenerateSubQuestionOptions

export type GenerateAnswerOptions =
  | GenerateTextAnswerOptions
  | GenerateScoredTextAnswerOptions
  | GenerateChoiceAnswerOptions
  | GenerateDropdownAnswerOptions
  | GenerateDNDAnswerOptions
  | GenerateAudioAnswerOptions

interface TextAnswerBase {
  hint?: string
  type?: 'rich-text' | 'single-line' | 'integer'
}

export interface GenerateTextAnswerOptions extends TextAnswerBase {
  name: 'text-answer'
  maxScore: number
  maxLength?: number
  meta?: string
}

export interface GenerateScoredTextAnswerOptions extends TextAnswerBase {
  name: 'scored-text-answer'
  maxScore?: number
  maxLength?: number
  acceptedAnswers?: GenerateAcceptedAnswer[]
  meta?: string
}

export interface GenerateAcceptedAnswer {
  score: number
  text: string
}

export interface GenerateChoiceAnswerOptions {
  name: 'choice-answer'
  options: GenerateChoiceAnswerOption[]
}

export interface GenerateDNDAnswerOptions {
  name: 'dnd-answer'
  options: GenerateChoiceAnswerOption[]
}

export interface GenerateDropdownAnswerOptions {
  name: 'dropdown-answer'
  options: GenerateChoiceAnswerOption[]
}

export interface GenerateChoiceAnswerOption {
  score: number
  text: string
}

export interface GenerateAudioAnswerOptions {
  name: 'audio-answer'
  maxScore: number
}
/**
 * Generates an exam XML file (mostly for testing purposes) based on a
 * description of the exam structure.
 *
 * - An exam is an object containing the array of sections and optional attributes.
 * - A section is object containing the array of questions and optional attributes.
 * - A question is an array of answers or subquestions.
 * - An answer is an object describing the answer.
 *
 * ```
 * generateExam({
 *   sections: [
 *     // Section I
 *     {
 *       questions: [
 *         // Question 1 containing a single text-answer.
 *         [textAnswer()],
 *         // Question 2 containing three choice-answers.
 *         [choiceAnswer(), choiceAnswer(), choiceAnswer()],
 *         // Question 3 containing subquestions
 *         [
 *            // Question 3.1, containing a single dropdown-answer
 *            [dropdownAnswer()],
 *         ]
 *       ]
 *     }
 * ]
 * })
 * ```
 *
 * You can customize the exam and section elements by providing some of the
 * optional attributes.
 *
 * ```
 * generateExam({
 *   examCode: 'M',
 *   date: '2020-03-18',
 *   sections: [{
 *     casForbidden: true,
 *     maxAnswers: 5,
 *     questions: […]
 *   }, {
 *     casForbidden: false,
 *     maxAnswers: 5,
 *     questions: […]
 *   }]
 * })
 * ```
 *
 * It is also possible to customize the answer elements. For example, if you
 * need a text-answer with a different max-score, you can override the default
 * attributes in the various fooAnswer-functions.
 *
 * ```
 * generateExam({ sections: [{ questions: [[textAnswer({ maxScore: 10 })]] }] })
 * ```
 */
export function generateExam(options: GenerateExamOptions): string {
  const doc = new libxml.Document()
  const exam = createElement(doc, 'exam', undefined, {
    xmlns: 'http://www.w3.org/1999/xhtml',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'http://ylioppilastutkinto.fi/exam.xsd https://abitti.net/schema/exam.xsd',
    'exam-schema-version': '0.5',
    'exam-code': options.examCode,
    'day-code': options.dayCode,
    date: options.date,
    'max-answers': options.maxAnswers
  })
  const examVersions = options.examVersions ?? [{ language: 'fi-FI' }]
  const languages = examVersions.map(v => v.language)
  const examVersionsElement = createElement(exam, 'exam-versions')

  for (const { language, type } of examVersions) {
    createElement(examVersionsElement, 'exam-version', undefined, { lang: language, 'exam-type': type })
  }

  if (!options.examCode) {
    createLocalizedElement(exam, 'exam-title', languages, { 'fi-FI': 'Kokeen otsikko', 'sv-FI': 'Provets titel' })
  }

  for (const section of options.sections) {
    addSection(exam, languages, section)
  }

  return doc.toString(true)
}

function addSection(exam: libxml.Element, languages: Language[], options: GenerateSectionOptions): void {
  const section = createElement(exam, 'section', undefined, {
    'max-answers': options.maxAnswers,
    'cas-forbidden': options.casForbidden,
    type: options.type
  })

  createLocalizedElement(section, 'section-title', languages, { 'fi-FI': 'Osan otsikko', 'sv-FI': 'Delens titel' })

  for (const question of options.questions) {
    addQuestion(section, languages, question)
  }
}

function addQuestion(parent: libxml.Element, languages: Language[], options: GenerateQuestionOptions): void {
  const question = createElement(parent, 'question', undefined, { 'max-answers': options.maxAnswers })
  createLocalizedElement(question, 'question-title', languages, {
    'fi-FI': 'Kysymyksen otsikko',
    'sv-FI': 'Uppgiftens titel'
  })

  if ('questions' in options) {
    for (const subQuestion of options.questions) {
      addQuestion(question, languages, subQuestion)
    }
  } else {
    for (const answer of options.answers) {
      switch (answer.name) {
        case 'text-answer':
        case 'scored-text-answer': {
          addTextAnswer(question, answer)
          break
        }
        case 'choice-answer':
        case 'dropdown-answer': {
          addChoiceAnswer(question, answer)
          break
        }
        case 'dnd-answer': {
          addDNDAnswer(question, answer)
          break
        }
        case 'audio-answer': {
          addAudioAnswer(question, answer)
          break
        }
      }
    }
  }
}

function addTextAnswer(
  question: libxml.Element,
  options: GenerateTextAnswerOptions | GenerateScoredTextAnswerOptions
): void {
  const answer = createElement(question, options.name, undefined, {
    'max-score': options.maxScore,
    'max-length': options.maxLength,
    type: options.type,
    meta: options.meta
  })

  if (options.hint) {
    createElement(answer, 'hint', options.hint)
  }

  if (options.name === 'scored-text-answer' && options.acceptedAnswers) {
    for (const { score, text } of options.acceptedAnswers) {
      createElement(answer, 'accepted-answer', text, { score })
    }
  }
}

function addChoiceAnswer(
  question: libxml.Element,
  options: GenerateChoiceAnswerOptions | GenerateDropdownAnswerOptions
): void {
  const answer = createElement(question, options.name)
  const optionType = options.name === 'choice-answer' ? 'choice-answer-option' : 'dropdown-answer-option'

  for (const { text, score } of options.options) {
    createElement(answer, optionType, text, { score })
  }
}

function addDNDAnswer(question: libxml.Element, options: GenerateDNDAnswerOptions): void {
  const container = createElement(question, 'dnd-answer-container')
  for (const { text, score } of options.options) {
    const optionType = 'dnd-answer-option'
    if (score === 0) {
      createElement(container, optionType, text)
    } else {
      const answer = createElement(container, options.name, '', { 'max-score': score })
      createElement(answer, 'dnd-answer-title', `Title for ${text}`)
      createElement(answer, optionType, text, { score })
    }
  }
}

function addAudioAnswer(question: libxml.Element, options: GenerateAudioAnswerOptions): void {
  createElement(question, options.name, undefined, {
    'max-score': options.maxScore
  })
}

function createElement(
  parent: libxml.Element | libxml.Document,
  localName: string,
  content?: string,
  attrs?: Record<string, unknown>
): libxml.Element {
  const element = parent.node(localName, content).namespace('e', 'http://ylioppilastutkinto.fi/exam.xsd')

  if (attrs) {
    Object.entries(attrs)
      .filter(([, value]) => value != null)
      .forEach(([name, value]) => element.attr(name, String(value)))
  }

  return element
}

function createLocalizedElement(
  parent: libxml.Element,
  localName: string,
  languages: Language[],
  content: Record<Language, string>,
  attrs?: Record<string, unknown>
) {
  if (languages.length === 1) {
    const [language] = languages
    return createElement(parent, localName, content[language], attrs)
  }

  const element = createElement(parent, localName, undefined, attrs)

  Object.entries(content)
    .filter(([language]) => languages.includes(language as Language))
    .forEach(([lang, text]) => createElement(element, 'localization', text, { lang }))

  return element
}
