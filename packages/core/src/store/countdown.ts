import { END, eventChannel, EventChannel } from 'redux-saga'
import { call, cancelled, put, take } from 'redux-saga/effects'
import { Action } from 'typesafe-actions'

const countdownChannel = (duration: number) =>
  eventChannel<number>((emit) => {
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function* countdown(duration: number, updateAction: (duration: number) => Action<any>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const channel: EventChannel<number> = yield call(countdownChannel, duration)

  try {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const remaining: number = yield take(channel)
      yield put(updateAction(remaining))
    }
  } finally {
    if ((yield cancelled()) as boolean) {
      channel.close()
    }
  }
}
