import { Task } from 'redux-saga'
import { call, cancel, delay, fork, put, take } from 'redux-saga/effects'
import { ExamAnswer, ExamServerAPI } from '../../types'
import { saveAnswer, saveAnswerFailed, saveAnswerSucceeded, selectAnswerVersion } from './actions'

type SaveAnswerAction = ReturnType<typeof saveAnswer>
type SelectAnswerAction = ReturnType<typeof selectAnswerVersion>

const tasks = new Map<number, Task>()

function* performSave(action: SaveAnswerAction, examServerApi: ExamServerAPI) {
  const answer = action.payload

  try {
    yield delay(1000)
    yield call(examServerApi.saveAnswer, answer)
    yield put(saveAnswerSucceeded(answer))
  } catch (error) {
    yield put(saveAnswerFailed(answer, error))
  }

  tasks.delete(answer.questionId)
}

export function* answersSaga(examServerApi: ExamServerAPI) {
  // Approximate takeLatest, except grouped by question id.
  // https://redux-saga.js.org/docs/api/#takelatestpattern-saga-args
  while (true) {
    const action: SaveAnswerAction = yield take('SAVE_ANSWER')
    const existing = tasks.get(action.payload.questionId)
    if (existing) {
      yield cancel(existing)
    }
    const task = yield fork(performSave, action, examServerApi)
    tasks.set(action.payload.questionId, task)
  }
}

function* answerHistorySaga(examServerApi: ExamServerAPI) {
  while (true && examServerApi.selectAnswerVersion) {
    const action: SelectAnswerAction = yield take('SELECT_ANSWER_VERSION')
    const { questionId, questionText } = action.payload
    try {
      const maybeNewAnswer: ExamAnswer | undefined = yield call(
        examServerApi.selectAnswerVersion,
        questionId,
        questionText
      )
      if (maybeNewAnswer) {
        yield put(saveAnswer(maybeNewAnswer))
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export default function* root(examServerApi: ExamServerAPI) {
  yield fork(answersSaga, examServerApi)
  yield fork(answerHistorySaga, examServerApi)
}
