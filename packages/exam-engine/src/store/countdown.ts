import { END, eventChannel } from 'redux-saga'
import { call, cancelled, put, take } from 'redux-saga/effects'
import { Action } from 'typesafe-actions'

const countdownChannel = (duration: number) =>
  eventChannel<number>(emit => {
    const intervalId = setInterval(() => {
      duration--
      if (duration > 0) {
        emit(duration)
      } else {
        emit(END)
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  })

export function* countdown(duration: number, updateAction: (duration: number) => Action<any>) {
  const channel = yield call(countdownChannel, duration)

  try {
    while (true) {
      const remaining = yield take(channel)
      yield put(updateAction(remaining))
    }
  } finally {
    if (yield cancelled()) {
      channel.close()
    }
  }
}
