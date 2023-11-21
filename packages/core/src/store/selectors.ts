import * as _ from 'lodash-es'
import { AppState } from '.'
import { AudioPlaybackError, ExamAnswer, QuestionId, RestrictedAudioId, SaveState } from '..'

export const getAudioState =
  (src: string, restrictedAudioId?: RestrictedAudioId) =>
  (state: AppState): 'stopped' | 'playing' | 'other-playing' => {
    const { nowPlaying } = state.audio

    return nowPlaying == null
      ? 'stopped'
      : nowPlaying.audio.restrictedAudioId === restrictedAudioId && nowPlaying.audio.src === src
        ? 'playing'
        : 'other-playing'
  }

export const getAudioPlaybackError =
  (src: string, restrictedAudioId?: RestrictedAudioId) =>
  (state: AppState): AudioPlaybackError | undefined =>
    state.audio.errors[restrictedAudioId != null ? restrictedAudioId : src]

export const getDurationRemaining =
  (src: string, restrictedAudioId?: RestrictedAudioId) =>
  (state: AppState): number | undefined =>
    getAudioState(src, restrictedAudioId)(state) === 'playing' ? state.audio.nowPlaying!.durationRemaining : undefined

export const getPlaybackTimes =
  (restrictedAudioId: RestrictedAudioId) =>
  (state: AppState): number =>
    _.get(state.audio.playbackTimes, restrictedAudioId, 0)

export const getPlaybackTimesRemaining =
  (restrictedAudioId: RestrictedAudioId, times: number) =>
  (state: AppState): number =>
    times - getPlaybackTimes(restrictedAudioId)(state)

export const getSaveState = (state: AppState): SaveState => {
  const { serverQuestionIds, savedQuestionIds, answersById } = state.answers

  if (serverQuestionIds.size === 0) {
    return 'initial'
  } else if (
    serverQuestionIds.size !== savedQuestionIds.size ||
    containsAnswerNotYetSavedInServer(serverQuestionIds, answersById)
  ) {
    return 'saving'
  } else {
    return 'saved'
  }
}

function containsAnswerNotYetSavedInServer(
  serverIds: Set<QuestionId>,
  answersById: Record<QuestionId, ExamAnswer>
): boolean {
  for (const questionId in answersById) {
    if (!serverIds.has(Number(questionId))) {
      return true
    }
  }
  return false
}
