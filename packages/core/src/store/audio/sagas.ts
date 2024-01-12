import { call, delay, put, select, takeEvery } from 'redux-saga/effects'
import { countdown } from '../countdown'
import { getPlaybackTimes } from '../selectors'
import {
  hideAudioError,
  playAudio,
  playAudioFinished,
  playAudioStarted,
  showAudioError,
  updateRemaining
} from './actions'
import { AudioPlaybackResponse, ExamServerAPI } from '../..'
import { Audio } from './reducer'

type PlayAudio = ReturnType<typeof playAudio>

async function loadAndPlayRestrictedAudio(
  examServerApi: ExamServerAPI,
  restrictedAudioId: number,
  audio: HTMLAudioElement,
  playbackTimes: number
) {
  try {
    const response = await examServerApi.getRestrictedAudio('', restrictedAudioId, playbackTimes)
    const source = audio.querySelector('source')!
    source.src = URL.createObjectURL(response)
    audio.load()
    void audio.play()
    return {
      result: 'ok',
      cleanup: () => {
        URL.revokeObjectURL(source.src)
      }
    }
  } catch (_) {
    return { result: 'other-error', cleanup: () => {} }
  }
}

function* handleResponse(response: AudioPlaybackResponse, audio: Audio) {
  if (response === 'ok') {
    yield put(playAudioStarted(audio))
    yield call(countdown, audio.duration, updateRemaining)
    yield put(playAudioFinished())
  } else {
    yield put(showAudioError(audio, response))
    yield delay(5000)
    yield put(hideAudioError(audio))
  }
}

function* performPlayAudio(examServerApi: ExamServerAPI, action: PlayAudio) {
  const audio = action.payload

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const playbackTimes: number | undefined =
      audio.restrictedAudioId != null ? yield select(getPlaybackTimes(audio.restrictedAudioId)) : undefined

    if (audio.audioRef) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response: { result: AudioPlaybackResponse; cleanup: () => void } = yield loadAndPlayRestrictedAudio(
        examServerApi,
        audio.restrictedAudioId!,
        audio.audioRef.current!,
        playbackTimes!
      )
      yield handleResponse(response.result, audio)
      yield response.cleanup()
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response: AudioPlaybackResponse =
        playbackTimes != null && audio.restrictedAudioId != null
          ? yield call(examServerApi.playRestrictedAudio, audio.src, audio.restrictedAudioId, playbackTimes)
          : yield call(examServerApi.playAudio, audio.src)
      yield handleResponse(response, audio)
    }
  } catch (error) {
    console.error(error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function* audioSaga(examServerApi: ExamServerAPI) {
  yield takeEvery('PLAY_AUDIO', performPlayAudio, examServerApi)
}
