export type QuestionId = number

export type ExamPage = 'exam' | 'results' | 'grading-instructions'

interface AnswerCommon {
  questionId: QuestionId
  value: string
  /** This field is undefined in older exams that were packaged before this change. */
  displayNumber?: string
  answerNonAnswer?: boolean
}

export interface TextAnswer extends AnswerCommon {
  type: 'text'
  characterCount: number
}

export interface RichTextAnswer extends AnswerCommon {
  type: 'richText'
  characterCount: number
}

export interface ChoiceAnswer extends AnswerCommon {
  type: 'choice'
}

export type ExamAnswer = TextAnswer | RichTextAnswer | ChoiceAnswer
