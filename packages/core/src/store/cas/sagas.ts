import { call, put, race, take, takeLatest } from 'redux-saga/effects'
import { countdown } from '../countdown'
import { allowCas, allowCasCancelled, allowCasCountdown, allowCasSucceeded, updateCasRemaining } from './actions'
import { CasStatus, ExamServerAPI } from '../../types/ExamServerAPI'

export function* performEnableCas(examServerApi: ExamServerAPI, { payload }: ReturnType<typeof allowCas>) {
  try {
    const status1: CasStatus = yield call(examServerApi.setCasStatus, 'allowing')
    if (status1 === 'allowed') {
      return yield put(allowCasSucceeded())
    }

    yield put(allowCasCountdown(payload))
    const { cancelled } = yield race({
      finished: call(countdown, payload, updateCasRemaining),
      cancelled: take('ALLOW_CAS_CANCELLED'),
    })

    const status2: CasStatus = yield call(examServerApi.setCasStatus, cancelled ? 'forbidden' : 'allowed')
    if (status2 === 'allowed') {
      yield put(allowCasSucceeded())
    } else if (!cancelled) {
      yield put(allowCasCancelled())
    }
  } catch (error) {
    console.error(error)
  }
}

export default function* casSaga(examServerApi: ExamServerAPI) {
  yield takeLatest('ALLOW_CAS', performEnableCas, examServerApi)
}
