import * as _ from 'lodash-es'
import { ActionType } from 'typesafe-actions'
import * as actions from './actions'
import { AudioError, RestrictedAudioId } from '../..'
import { MutableRefObject } from 'react'

type AudioAction = ActionType<typeof actions>

export interface Audio {
  /** The source filename */
  src: string
  /** Duration in seconds */
  duration: number
  /** An unique identifier for each restricted audio element. For compatibility with KTP. */
  restrictedAudioId?: number
  /** Ref to audio element */
  audioRef?: MutableRefObject<HTMLAudioElement | null>
}

export interface NowPlaying {
  audio: Audio
  durationRemaining: number
}

export interface AudioState {
  errors: Record<string | RestrictedAudioId, AudioError>
  nowPlaying: NowPlaying | null
  playbackTimes: Record<RestrictedAudioId, number>
}

const initialState: AudioState = {
  errors: {},
  nowPlaying: null,
  playbackTimes: {}
}

export default function audioReducer(state: AudioState = initialState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'PLAY_AUDIO': {
      const audio = action.payload
      const nowPlaying = { audio, durationRemaining: audio.duration }
      return { ...state, nowPlaying }
    }
    case 'PLAY_AUDIO_STARTED': {
      const audio = action.payload
      if (audio.restrictedAudioId != null) {
        const listened = state.playbackTimes[audio.restrictedAudioId]
        const playbackTimes = {
          ...state.playbackTimes,
          [audio.restrictedAudioId]: listened ? listened + 1 : 1
        }
        const errors = _.omit(state.errors, [audio.src])
        return { ...state, playbackTimes, errors }
      } else {
        return state
      }
    }
    case 'SHOW_AUDIO_ERROR': {
      const { audio, error } = action.payload
      const key = _.get(audio, 'restrictedAudioId', audio.src)
      const errors = {
        ...state.errors,
        [key]: error
      }
      return { ...state, errors, nowPlaying: null }
    }
    case 'HIDE_AUDIO_ERROR': {
      const audio = action.payload
      const key = _.get(audio, 'restrictedAudioId', audio.src)
      const errors = _.omit(state.errors, [key])
      return { ...state, errors }
    }
    case 'PLAY_AUDIO_FINISHED':
      return { ...state, nowPlaying: null }
    case 'UPDATE_REMAINING': {
      const durationRemaining = action.payload
      const nowPlaying = { ...state.nowPlaying!, durationRemaining }
      return { ...state, nowPlaying }
    }
    default:
      return state
  }
}
