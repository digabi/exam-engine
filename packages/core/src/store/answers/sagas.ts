import { Task } from 'redux-saga'
import { call, cancel, delay, fork, put, take } from 'redux-saga/effects'
import { ExamAnswer, ExamServerAPI } from '../..'
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function* answersSaga(examServerApi: ExamServerAPI) {
  // Approximate takeLatest, except grouped by question id.
  // https://redux-saga.js.org/docs/api/#takelatestpattern-saga-args
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const action: SaveAnswerAction = yield take('SAVE_ANSWER')
    const existing = tasks.get(action.payload.questionId)
    if (existing) {
      yield cancel(existing)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const task: Task = yield fork(performSave, action, examServerApi)
    tasks.set(action.payload.questionId, task)
  }
}

function* answerHistorySaga(examServerApi: ExamServerAPI) {
  while (examServerApi.selectAnswerVersion) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const action: SelectAnswerAction = yield take('SELECT_ANSWER_VERSION')
    const { questionId, questionText } = action.payload
    if (examServerApi.logActivity) {
      yield call(examServerApi.logActivity, `Opened answer version history for question ${questionId}, ${questionText}`)
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const maybeNewAnswer: ExamAnswer | undefined = yield call(
        examServerApi.selectAnswerVersion,
        questionId,
        questionText
      )
      if (maybeNewAnswer) {
        yield put(saveAnswer(maybeNewAnswer))
        if (examServerApi.logActivity) {
          yield call(examServerApi.logActivity, `Restored answer version for question ${questionId}, ${questionText}`)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function* root(examServerApi: ExamServerAPI) {
  yield fork(answersSaga, examServerApi)
  yield fork(answerHistorySaga, examServerApi)
}
