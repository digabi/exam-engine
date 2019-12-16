import { action } from 'typesafe-actions'
import { AudioPlaybackError } from '../../components/types'
import { Audio } from './reducer'

export const playAudio = (audio: Audio) => action('PLAY_AUDIO', audio)

export const playAudioStarted = (audio: Audio) => action('PLAY_AUDIO_STARTED', audio)

export const playAudioFinished = () => action('PLAY_AUDIO_FINISHED')

export const showAudioError = (audio: Audio, error: AudioPlaybackError) => action('SHOW_AUDIO_ERROR', { audio, error })

export const hideAudioError = (audio: Audio) => action('HIDE_AUDIO_ERROR', audio)

export const updateRemaining = (remaining: number) => action('UPDATE_REMAINING', remaining)
