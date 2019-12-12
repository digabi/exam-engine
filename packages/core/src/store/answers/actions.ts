import { action } from 'typesafe-actions'
import { ExamAnswer, QuestionId } from '../../components/types'

export const saveAnswer = (answer: ExamAnswer) => action('SAVE_ANSWER', answer)

export const saveAnswerSucceeded = (answer: ExamAnswer) => action('SAVE_ANSWER_SUCCEEDED', answer)

export const saveAnswerFailed = (answer: ExamAnswer, error: Error) =>
  action('SAVE_ANSWER_FAILED', { answer, error }, undefined, true)

export const selectAnswerVersion = (questionId: QuestionId, questionText: string) =>
  action('SELECT_ANSWER_VERSION', { questionId, questionText })

export const answerFocused = (questionId: QuestionId) => action('ANSWER_FOCUSED', questionId)

export const answerBlurred = (questionId: QuestionId) => action('ANSWER_BLURRED', questionId)
