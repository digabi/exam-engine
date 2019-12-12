import { Element } from 'libxmljs2'

export const ns = { e: 'http://ylioppilastutkinto.fi/exam.xsd' }

export const textAnswerTypes = ['text-answer', 'scored-text-answer'] as const
export const choiceAnswerTypes = ['choice-answer', 'dropdown-answer'] as const
export const answerTypes = [...textAnswerTypes, ...choiceAnswerTypes]

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
}

export interface Answer {
  element: Element
  question: Element
}
