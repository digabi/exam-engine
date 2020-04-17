export interface GradingStructure {
  questions: GradingStructureQuestion[]
}

export type GradingStructureQuestion = TextQuestion | ChoiceGroupQuestion

export interface TextQuestion {
  type: 'text'
  id: number
  displayNumber: string
  maxScore: number
  /**
   * A tentative list of answers that will be accepted. Usually this is not the
   * final list, since additional answers will be accepted during grading.
   *
   * If omitted, the question will be graded manually.
   */
  correctAnswers?: CorrectAnswer[]
}

export interface CorrectAnswer {
  text: string
  score: number
}

export interface ChoiceGroupQuestion {
  type: 'choicegroup'
  id: number
  displayNumber: string
  choices: ChoiceGroupChoice[]
}

export interface ChoiceGroupChoice {
  id: number
  displayNumber: string
  type: 'choice'
  options: ChoiceGroupOption[]
}

export interface ChoiceGroupOption {
  id: number
  correct: boolean
  score: number
}
