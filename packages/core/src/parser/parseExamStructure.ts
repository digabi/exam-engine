import { getAttribute, getNumericAttribute, queryAll } from '../dom-utils'

export interface BaseElement {
  name: string
  childNodes: ExamElement[]
}

export interface RootElement extends BaseElement {
  name: 'exam'
  attributes: {
    maxAnswers?: number
  }
}

export interface SectionElement extends BaseElement {
  name: 'section'
  attributes: {
    displayNumber: string
    maxAnswers?: number
    minAnswers?: number
  }
}

export interface QuestionElement extends BaseElement {
  name: 'question'
  attributes: {
    displayNumber: string
    maxAnswers?: number
  }
}

export interface TextAnswerElement extends BaseElement {
  name: 'text-answer'
  attributes: {
    displayNumber: string
    questionId: number
    maxLength?: number
  }
}

export interface ScoredTextAnswerElement extends BaseElement {
  name: 'scored-text-answer'
  attributes: {
    displayNumber: string
    questionId: number
  }
}

export interface ChoiceAnswerElement extends BaseElement {
  name: 'choice-answer'
  attributes: {
    displayNumber: string
    questionId: number
  }
}

export interface DropdownAnswerElement extends BaseElement {
  name: 'dropdown-answer'
  attributes: {
    displayNumber: string
    questionId: number
  }
}

export interface DragAndDropAnswerElement extends BaseElement {
  name: 'dnd-answer'
  attributes: {
    displayNumber: string
    questionId: number
  }
}

export interface AudioAnswerElement extends BaseElement {
  name: 'audio-answer'
  attributes: {
    displayNumber: string
    questionId: number
  }
}

export type ExamElement = RootElement | SectionElement | QuestionElement | AnswerElement

export type AnswerElement =
  | TextAnswerElement
  | ScoredTextAnswerElement
  | ChoiceAnswerElement
  | DropdownAnswerElement
  | DragAndDropAnswerElement
  | AudioAnswerElement

export function parseExamStructure(doc: XMLDocument): RootElement {
  const root = doc.documentElement
  const sections = queryAll(root, 'section', false).map(parseSection)
  return parseElement(root, sections, { maxAnswers: getNumericAttribute(root, 'max-answers') })
}

function parseSection(section: Element): SectionElement {
  const questions = queryAll(section, 'question', false).map(parseQuestion)
  return parseElement<SectionElement>(section, questions, {
    displayNumber: getAttribute(section, 'display-number')!,
    minAnswers: getNumericAttribute(section, 'min-answers'),
    maxAnswers: getNumericAttribute(section, 'max-answers')
  })
}

function parseQuestion(question: Element): QuestionElement {
  const childQuestions = queryAll(question, 'question', false)
  const childElements = childQuestions.length
    ? childQuestions.map(parseQuestion)
    : queryAll(
        question,
        ['text-answer', 'scored-text-answer', 'choice-answer', 'dropdown-answer', 'dnd-answer', 'audio-answer'],
        false
      ).map(parseAnswer)
  return parseElement<QuestionElement>(question, childElements, {
    displayNumber: getAttribute(question, 'display-number')!,
    maxAnswers: getNumericAttribute(question, 'max-answers')
  })
}

function parseAnswer(answer: Element): AnswerElement {
  const attributes = {
    displayNumber: getAttribute(answer, 'display-number')!,
    questionId: getNumericAttribute(answer, 'question-id')!,
    maxLength: getNumericAttribute(answer, 'max-length')
  }
  return parseElement(answer, [], attributes)
}

function parseElement<T extends ExamElement>(
  element: Element,
  childNodes: ExamElement[],
  attributes: T['attributes']
): T {
  return {
    name: element.localName,
    attributes,
    childNodes
  } as T
}
