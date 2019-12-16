import * as _ from 'lodash-es'
import { AudioPlaybackError, RestrictedAudioId } from '../components/types'
import { AppState } from '../store'

export const getAudioState = (src: string, restrictedAudioId?: RestrictedAudioId) => (state: AppState) => {
  const { nowPlaying } = state.audio

  return nowPlaying == null
    ? 'stopped'
    : nowPlaying.audio.restrictedAudioId === restrictedAudioId && nowPlaying.audio.src === src
    ? 'playing'
    : 'other-playing'
}

export const getAudioPlaybackError = (src: string, restrictedAudioId?: RestrictedAudioId) => (
  state: AppState
): AudioPlaybackError | undefined => state.audio.errors[restrictedAudioId != null ? restrictedAudioId : src]

export const getDurationRemaining = (src: string, restrictedAudioId?: RestrictedAudioId) => (state: AppState) =>
  getAudioState(src, restrictedAudioId)(state) === 'playing' ? state.audio.nowPlaying!.durationRemaining : undefined

export const getPlaybackTimes = (restrictedAudioId: RestrictedAudioId) => (state: AppState) =>
  _.get(state.audio.playbackTimes, restrictedAudioId, 0)

export const getPlaybackTimesRemaining = (restrictedAudioId: RestrictedAudioId, times: number) => (state: AppState) =>
  times - getPlaybackTimes(restrictedAudioId)(state)
