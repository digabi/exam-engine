import * as libxml from 'libxmljs2'

export interface GenerateExamOptions {
  date?: string
  examCode?: string
  dayCode?: string
  maxAnswers?: number
  languages?: string[]
  sections: GenerateSectionOptions[]
}

export interface GenerateSectionOptions {
  maxAnswers?: number
  casForbidden?: boolean
  questions: GenerateQuestionOptions[][]
}

export type GenerateQuestionOptions =
  | GenerateQuestionOptions[]
  | GenerateTextAnswerOptions
  | GenerateScoredTextAnswerOptions
  | GenerateChoiceAnswerOptions
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
    'xsi:schemaLocation': 'http://ylioppilastutkinto.fi/exam.xsd https://abitti.dev/schema/exam.xsd',
    'exam-schema-version': '0.1',
    'exam-code': options.examCode,
    'day-code': options.dayCode,
    date: options.date,
    'max-answers': options.maxAnswers,
  })
  const languages = createElement(exam, 'languages')
  for (const language of options.languages ?? ['fi-FI']) {
    createElement(languages, 'language', language)
  }
  createElement(exam, 'exam-title', 'Kokeen otsikko')

  for (const section of options.sections) {
    addSection(exam, section)
  }

  return doc.toString(true)
}

function addSection(exam: libxml.Element, options: GenerateSectionOptions): void {
  const section = createElement(exam, 'section', undefined, {
    'max-answers': options.maxAnswers,
    'cas-forbidden': options.casForbidden,
  })

  createElement(section, 'section-title', 'Osan otsikko')

  for (const question of options.questions) {
    addQuestion(section, question)
  }
}

function addQuestion(parent: libxml.Element, options: GenerateQuestionOptions): void {
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
    type: options.type,
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

export function textAnswer(options?: Partial<GenerateTextAnswerOptions>): GenerateTextAnswerOptions {
  return {
    name: 'text-answer',
    maxScore: 6,
    type: 'rich-text',
    ...options,
  }
}

export function scoredTextAnswer(options?: Partial<GenerateScoredTextAnswerOptions>): GenerateScoredTextAnswerOptions {
  return {
    name: 'scored-text-answer',
    hint: 'Vihje',
    acceptedAnswers: [
      {
        text: 'Oikea vaihtoehto',
        score: 3,
      },
    ],
    ...options,
  }
}

export function choiceAnswer(options?: Partial<GenerateChoiceAnswerOptions>): GenerateChoiceAnswerOptions {
  return {
    name: 'choice-answer',
    options: [
      {
        text: 'Oikea vaihtoehto',
        score: 3,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
    ],
    ...options,
  }
}

export function dropdownAnswer(options?: Partial<GenerateDropdownAnswerOptions>): GenerateDropdownAnswerOptions {
  return {
    name: 'dropdown-answer',
    options: [
      {
        text: 'Oikea vaihtoehto',
        score: 3,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
    ],
    ...options,
  }
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
