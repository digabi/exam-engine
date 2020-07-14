import { call, delay, put, select, takeEvery } from 'redux-saga/effects'
import { countdown } from '../countdown'
import { getPlaybackTimes } from '../selectors'
import {
  hideAudioError,
  playAudio,
  playAudioFinished,
  playAudioStarted,
  showAudioError,
  updateRemaining,
} from './actions'
import { AudioPlaybackResponse, ExamServerAPI } from '../../types/ExamServerAPI'

type PlayAudio = ReturnType<typeof playAudio>

function* performPlayAudio(examServerApi: ExamServerAPI, action: PlayAudio) {
  const audio = action.payload

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const playbackTimes: number | undefined =
      audio.restrictedAudioId != null ? yield select(getPlaybackTimes(audio.restrictedAudioId)) : undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: AudioPlaybackResponse =
      playbackTimes != null && audio.restrictedAudioId != null
        ? yield call(examServerApi.playRestrictedAudio, audio.src, audio.restrictedAudioId, playbackTimes)
        : yield call(examServerApi.playAudio, audio.src)
    if (response === 'ok') {
      yield put(playAudioStarted(audio))
      yield call(countdown, audio.duration, updateRemaining)
      yield put(playAudioFinished())
    } else {
      yield put(showAudioError(audio, response))
      yield delay(5000)
      yield put(hideAudioError(audio))
    }
  } catch (error) {
    console.error(error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function* audioSaga(examServerApi: ExamServerAPI) {
  yield takeEvery('PLAY_AUDIO', performPlayAudio, examServerApi)
}
