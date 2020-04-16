import { ns } from '@digabi/exam-engine-mastering'
import * as libxml from 'libxmljs2'

interface ExamOptions {
  date?: string
  examCode?: string
  dayCode?: string
  maxAnswers?: number
  languages?: string[]
  sections: GenerateSectionOptions[]
}
export type GenerateExamOptions = GenerateSectionOptions[] | ExamOptions

interface SectionOptions {
  maxAnswers?: number
  casForbidden?: boolean
  questions: GenerateQuestionOptions[][]
}
export type GenerateSectionOptions = GenerateQuestionOptions[][] | SectionOptions

type QuestionOptions =
  | QuestionOptions[]
  | GenerateTextAnswerOptions
  | GenerateScoredTextAnswerOptions
  | GenerateChoiceAnswerOptions
  | GenerateDropdownAnswerOptions
export type GenerateQuestionOptions =
  | GenerateQuestionOptions[]
  | 'text-answer'
  | GenerateTextAnswerOptions
  | 'scored-text-answer'
  | GenerateScoredTextAnswerOptions
  | 'choice-answer'
  | GenerateChoiceAnswerOptions
  | 'dropdown-answer'
  | GenerateDropdownAnswerOptions

interface TextAnswerBase {
  hint?: string
  type?: 'rich-text' | 'single-line' | 'multi-line'
}

export interface GenerateTextAnswerOptions extends TextAnswerBase {
  name: 'text-answer'
  maxScore: number
}

export interface GenerateScoredTextAnswerOptions extends TextAnswerBase {
  name: 'scored-text-answer'
  maxScore?: number
  acceptedAnswers?: GenerateAcceptedAnswer[]
}

export interface GenerateAcceptedAnswer {
  score: number
  text: string
}

export interface GenerateChoiceAnswerOptions {
  name: 'choice-answer'
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

/**
 * Generates an exam XML file (mostly for testing purposes) based on a
 * description of the exam structure.
 *
 * - An exam is an array of sections (and optional attributes)
 * - A section is an array of questions (and optional attributes).
 * - A question is an array of answers.
 * - An answer s either the name of the answer element (e.g. `'text-answer'`)
 *   or an object describing the answer.
 *
 * ```
 * generateExam({
 *   sections: [
 *     // Section I
 *     {
 *       questions: [
 *         // Question 1 containing a single text-answer.
 *         ['text-answer'],
 *         // Question 2 containing three choice-answers.
 *         ['choice-answer', 'choice-answer', 'choice-answer'],
 *         // Question 3 containing subquestions
 *         [
 *            // Question 3.1, containing a single dropdown-answer
 *            ['dropdown-answer'],
 *         ]
 *       ]
 *     }
 * ]
 * })
 * ```
 *
 * As a shorthand, you can replace the exam object with a sections array and
 * the section object with a questions array. So the following are equivalent:
 *
 * ```
 * generateExam({sections: [{questions: [['text-answer']]}]}) ≡ generateExam([[['text-answer']]])
 * ```
 *
 * It is also possible to customize the answer elements. For example, if you
 * need a text-answer with a different max-score, you can use an object
 * describing the answer instead of a string containing the element name.
 *
 * ```
 * generateExam([[[{name: 'text-answer', maxScore: 10}]]])
 * ```
 */
export function generateExam(options: GenerateExamOptions): string {
  const opts = normalizeExamOptions(options)
  const doc = new libxml.Document()
  const exam = createElement(doc, 'exam', undefined, {
    xmlns: 'http://www.w3.org/1999/xhtml',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'http://ylioppilastutkinto.fi/exam.xsd https://abitti.dev/schema/exam.xsd',
    'exam-schema-version': '0.1',
    'exam-code': opts.examCode,
    'day-code': opts.dayCode,
    date: opts.date,
    'max-answers': opts.maxAnswers
  })
  const languages = createElement(exam, 'languages')
  for (const language of opts.languages ?? ['fi-FI']) {
    createElement(languages, 'language', language)
  }
  createElement(exam, 'exam-title', 'Kokeen otsikko')

  for (const section of opts.sections) {
    addSection(exam, normalizeSectionOptions(section))
  }

  return doc.toString(true)
}

function addSection(exam: libxml.Element, options: SectionOptions): void {
  const section = createElement(exam, 'section', undefined, {
    'max-answers': options.maxAnswers,
    'cas-forbidden': options.casForbidden
  })

  createElement(section, 'section-title', 'Osan otsikko')

  for (const question of options.questions) {
    addQuestion(section, normalizeQuestionOptions(question))
  }
}

function addQuestion(parent: libxml.Element, options: QuestionOptions): void {
  if (Array.isArray(options)) {
    const question = createElement(parent, 'question')
    createElement(question, 'question-title', 'Kysymyksen otsikko')
    for (const subquestionOptions of options) {
      addQuestion(question, subquestionOptions)
    }
  } else {
    switch (options.name) {
      case 'text-answer':
      case 'scored-text-answer':
        return addTextAnswer(parent, options)
      case 'choice-answer':
      case 'dropdown-answer':
        return addChoiceAnswer(parent, options)
    }
  }
}

function addTextAnswer(
  question: libxml.Element,
  options: GenerateTextAnswerOptions | GenerateScoredTextAnswerOptions
): void {
  const answer = createElement(question, options.name, undefined, {
    'max-score': options.maxScore,
    type: options.type
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

function normalizeExamOptions(options: GenerateExamOptions): ExamOptions {
  return Array.isArray(options) ? { sections: options } : options
}

function normalizeSectionOptions(options: GenerateSectionOptions): SectionOptions {
  return Array.isArray(options) ? { questions: options } : options
}

function normalizeQuestionOptions(options: GenerateQuestionOptions): QuestionOptions {
  switch (options) {
    case 'text-answer':
      return { name: 'text-answer', maxScore: 6 }
    case 'scored-text-answer':
      return {
        name: 'scored-text-answer',
        hint: 'Vihje',
        acceptedAnswers: [
          {
            text: 'Oikea vaihtoehto',
            score: 3
          }
        ]
      }
    case 'choice-answer':
    case 'dropdown-answer':
      return {
        name: options,
        options: [
          {
            text: 'Oikea vaihtoehto',
            score: 3
          },
          {
            text: 'Väärä vaihtoehto',
            score: 0
          },
          {
            text: 'Väärä vaihtoehto',
            score: 0
          }
        ]
      }
    default:
      return Array.isArray(options) ? options.map(normalizeQuestionOptions) : options
  }
}

function createElement(
  parent: libxml.Element | libxml.Document,
  localName: string,
  content?: string,
  attrs?: Record<string, unknown>
): libxml.Element {
  const element = parent.node(localName, content).namespace('e', ns.e)

  if (attrs) {
    Object.entries(attrs)
      .filter(([, value]) => value != null)
      .forEach(([name, value]) => element.attr(name, String(value)))
  }

  return element
}
