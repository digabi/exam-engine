import { call, put, race, take, takeLatest } from 'redux-saga/effects'
import { ExamServerAPI } from '../../components/types'
import { countdown } from '../countdown'
import { allowCas, allowCasCountdown, allowCasSucceeded, updateCasRemaining } from './actions'

function* performEnableCas(examServerApi: ExamServerAPI, { payload }: ReturnType<typeof allowCas>) {
  try {
    yield call(examServerApi.setCasStatus, 'allowing')
    yield put(allowCasCountdown(payload))
    const { cancelled } = yield race({
      finished: call(countdown, payload, updateCasRemaining),
      cancelled: take('ALLOW_CAS_CANCELLED')
    })
    if (cancelled) {
      yield call(examServerApi.setCasStatus, 'forbidden')
    } else {
      yield call(examServerApi.setCasStatus, 'allowed')
      yield put(allowCasSucceeded())
    }
  } catch (error) {
    console.error(error) // tslint:disable-line no-console
  }
}

export default function* casSaga(examServerApi: ExamServerAPI) {
  yield takeLatest('ALLOW_CAS', performEnableCas, examServerApi)
}
