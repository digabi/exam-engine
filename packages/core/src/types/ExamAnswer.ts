export type QuestionId = number

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

export interface DNDAnswer extends AnswerCommon {
  type: 'dnd'
}

export type ExamAnswer = TextAnswer | RichTextAnswer | ChoiceAnswer
