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
import AudioPlaybackError from '../../components/shared/internal/AudioPlaybackError'

type PlayAudio = ReturnType<typeof playAudio>

async function getAudioResponse(examServerApi: ExamServerAPI, audio: Audio, playbackTimes: number) {
  try {
    const response = await examServerApi.getRestrictedAudio(audio.src, audio.restrictedAudioId!, playbackTimes)
    const source = audio.audioRef!.current!.querySelector('source')!
    source.src = URL.createObjectURL(response)
    audio.audioRef!.current!.load()
    void audio.audioRef!.current!.play()
    return 'ok'
  } catch (err) {
    return (err as { message: AudioPlaybackError }).message
  }
}

function* performPlayAudio(examServerApi: ExamServerAPI, action: PlayAudio) {
  const audio = action.payload

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const playbackTimes: number | undefined =
      audio.restrictedAudioId != null ? yield select(getPlaybackTimes(audio.restrictedAudioId)) : undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: AudioPlaybackResponse =
      audio.audioRef && playbackTimes != null
        ? yield getAudioResponse(examServerApi, audio, playbackTimes)
        : playbackTimes != null && audio.restrictedAudioId != null
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
