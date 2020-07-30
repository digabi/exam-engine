import { ActionType } from 'typesafe-actions'
import * as actions from './actions'
import { ExamAnswer, QuestionId } from '../..'

type AnswersAction = ActionType<typeof actions>

export interface AnswersState {
  answersById: Record<QuestionId, ExamAnswer>
  /** The (text) answer that is focused right now. Used for e.g. highlighting the correct hint in scored text answers. */
  focusedQuestionId: QuestionId | null
  /**
   * The set of answers that (to the best of our knowledge) have been
   * successfully saved to the server. That is, the questions that we
   * show the "Tallennettu" indicator for.
   */
  savedQuestionIds: Set<QuestionId>
  /**
   * The set of questions that have been saved to the server at some point. Or
   * in short, the set of questions that we show the answer history link for.
   */
  serverQuestionIds: Set<QuestionId>
  /**
   * Whether or not the Exam API has implemented the optional answer history
   * feature. For now, only the real ktp has implemented it. it.
   */
  supportsAnswerHistory: boolean
}

const initialState: AnswersState = {
  answersById: {},
  focusedQuestionId: null,
  supportsAnswerHistory: false,
  serverQuestionIds: new Set(),
  savedQuestionIds: new Set(),
}

export default function answersReducer(state: AnswersState = initialState, action: AnswersAction): AnswersState {
  switch (action.type) {
    case 'SAVE_ANSWER': {
      const { questionId } = action.payload
      const synchronizedQuestionIds = setDelete(state.savedQuestionIds, questionId)
      const answersById = { ...state.answersById, [questionId]: action.payload }
      return { ...state, savedQuestionIds: synchronizedQuestionIds, answersById }
    }
    case 'SAVE_ANSWER_FAILED': {
      return state
    }
    case 'SAVE_ANSWER_SUCCEEDED': {
      const { questionId } = action.payload
      const savedQuestionIds = setAdd(state.savedQuestionIds, questionId)
      const serverQuestionIds = setAdd(state.serverQuestionIds, questionId)
      return { ...state, serverQuestionIds, savedQuestionIds }
    }
    case 'ANSWER_FOCUSED': {
      const questionId = action.payload
      return { ...state, focusedQuestionId: questionId }
    }
    case 'ANSWER_BLURRED': {
      const questionId = action.payload
      return { ...state, focusedQuestionId: state.focusedQuestionId === questionId ? null : state.focusedQuestionId }
    }
    default:
      return state
  }
}

function setAdd<T>(set: Set<T>, value: T): Set<T> {
  const copy = new Set(set)
  copy.add(value)
  return copy
}

function setDelete<T>(set: Set<T>, value: T): Set<T> {
  const copy = new Set(set)
  copy.delete(value)
  return copy
}
