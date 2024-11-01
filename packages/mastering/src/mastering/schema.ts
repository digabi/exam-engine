import { Element } from 'libxmljs2'

export const ns = { e: 'http://ylioppilastutkinto.fi/exam.xsd', xhtml: 'http://www.w3.org/1999/xhtml' }

export const textAnswerTypes = ['text-answer', 'scored-text-answer'] as const
export const choiceAnswerTypes = ['choice-answer', 'dropdown-answer'] as const
export const choiceAnswerOptionTypes = ['choice-answer-option', 'dropdown-answer-option', 'dnd-answer-option'] as const
export const dndAnswerTypes = ['dnd-answer'] as const
//export const dndAnswerOptionTypes = ['dnd-answer-option'] as const
export const answerTypes = [...textAnswerTypes, ...choiceAnswerTypes, ...dndAnswerTypes]

export const attachmentTypes = ['image', 'video', 'file', 'audio', 'audio-test'] as const

export interface Exam {
  element: Element
  sections: Section[]
  questions: Question[]
  topLevelQuestions: Question[]
  answers: Answer[]
}

export interface Section {
  element: Element
  questions: Question[]
}

export interface Question {
  element: Element
  childQuestions: Question[]
  answers: Answer[]
  gradingInstructions?: GradingInstruction[]
}

export interface Answer {
  element: Element
  question: Element
  gradingInstruction?: GradingInstruction
}

export interface GradingInstruction {
  element: Element
}
