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
      response: 'ok',
      cleanup: () => {
        URL.revokeObjectURL(source.src)
      }
    }
  } catch (_) {
    return { response: 'other-error', cleanup: () => {} }
  }
}

function handleAbitti2Audio(examServerApi: ExamServerAPI, audio: Audio, playbackTimes: number | undefined) {
  if (playbackTimes != null && audio.restrictedAudioId != null) {
    return loadAndPlayRestrictedAudio(examServerApi, audio.restrictedAudioId, audio.audioRef!.current!, playbackTimes)
  } else {
    void audio.audioRef!.current!.play()
    return { response: 'ok' }
  }
}

function* handleAbitti1Audio(examServerApi: ExamServerAPI, audio: Audio, playbackTimes: number | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const response: AudioPlaybackResponse =
    playbackTimes != null && audio.restrictedAudioId != null
      ? yield call(examServerApi.playRestrictedAudio, audio.src, audio.restrictedAudioId, playbackTimes)
      : yield call(examServerApi.playAudio, audio.src)
  return { response }
}

function* performPlayAudio(examServerApi: ExamServerAPI, action: PlayAudio) {
  const audio = action.payload
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const playbackTimes: number | undefined =
      audio.restrictedAudioId != null ? yield select(getPlaybackTimes(audio.restrictedAudioId)) : undefined

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: { response: AudioPlaybackResponse; cleanup?: () => void } =
      audio.audioRef && audio.audioRef.current
        ? yield handleAbitti2Audio(examServerApi, audio, playbackTimes)
        : yield handleAbitti1Audio(examServerApi, audio, playbackTimes)

    if (result.response === 'ok') {
      yield put(playAudioStarted(audio))
      yield call(countdown, audio.duration, updateRemaining)
      yield put(playAudioFinished())
    } else {
      yield put(showAudioError(audio, result.response))
      yield delay(5000)
      yield put(hideAudioError(audio))
    }
    if (result.cleanup) {
      result.cleanup()
    }
  } catch (error) {
    console.error(error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function* audioSaga(examServerApi: ExamServerAPI) {
  yield takeEvery('PLAY_AUDIO', performPlayAudio, examServerApi)
}
