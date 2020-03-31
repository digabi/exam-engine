import * as _ from 'lodash-es'
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { fork } from 'redux-saga/effects'
import { ExamAnswer, ExamServerAPI, InitialCasStatus, RestrictedAudioPlaybackStats } from '../components/types'
import answersReducer from './answers/reducer'
import answersSaga from './answers/sagas'
import audioReducer from './audio/reducer'
import audioSaga from './audio/sagas'
import casReducer from './cas/reducer'
import casSaga from './cas/sagas'

const rootReducer = combineReducers({
  answers: answersReducer,
  audio: audioReducer,
  cas: casReducer
})

function* rootSaga(examServerApi: ExamServerAPI) {
  yield fork(answersSaga, examServerApi)
  yield fork(audioSaga, examServerApi)
  yield fork(casSaga, examServerApi)
}

export type AppState = ReturnType<typeof rootReducer>

export function initializeExamStore(
  casStatus: InitialCasStatus,
  initialAnswers: ExamAnswer[],
  restrictedAudioPlaybackStats: RestrictedAudioPlaybackStats[],
  examServerApi: ExamServerAPI
): Store<AppState> {
  const initialQuestionIds = new Set(_.map(initialAnswers, 'questionId'))
  const playbackTimes = _.mapValues(_.keyBy(restrictedAudioPlaybackStats, 'restrictedAudioId'), 'times')
  const initialState: AppState = {
    answers: {
      answersById: _.keyBy(initialAnswers, 'questionId'),
      focusedQuestionId: null,
      serverQuestionIds: initialQuestionIds,
      supportsAnswerHistory: typeof examServerApi.selectAnswerVersion === 'function',
      savedQuestionIds: initialQuestionIds
    },
    audio: {
      errors: {},
      nowPlaying: null,
      playbackTimes
    },
    cas: { casStatus }
  }
  const sagaMiddleware = createSagaMiddleware()
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(sagaMiddleware)))
  sagaMiddleware.run(rootSaga, examServerApi)

  return store
}
