import * as _ from 'lodash-es'
import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { fork } from 'redux-saga/effects'
import answersReducer from './answers/reducer'
import answersSaga from './answers/sagas'
import audioReducer from './audio/reducer'
import audioSaga from './audio/sagas'
import casReducer from './cas/reducer'
import casSaga from './cas/sagas'
import { ExamAnswer, ExamServerAPI, InitialCasStatus, RestrictedAudioPlaybackStats } from '..'
import { RootElement } from '../parser/parseExamStructure'
import { validateAnswers } from '../validateAnswers'

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

// Ensure we can use useSelector and such with nicer type inference. Without this change, each use site of
// useSelector must explicitly type the state parameter, e.g.
//
// const foo = useSelector((state: AppState) => state.foo)
//
// With this change, the state type is inferred.
//
// const foo = useSelector((state) => state.foo)
declare module 'react-redux' {
  type DefaultRootState = AppState
}

export function initializeExamStore(
  examStructure: RootElement,
  casStatus: InitialCasStatus,
  initialAnswers: ExamAnswer[],
  restrictedAudioPlaybackStats: RestrictedAudioPlaybackStats[],
  examServerApi: ExamServerAPI
): Store<AppState> {
  const initialQuestionIds = new Set(_.map(initialAnswers, 'questionId'))
  const playbackTimes = _.mapValues(_.keyBy(restrictedAudioPlaybackStats, 'restrictedAudioId'), 'times')
  const answersById = _.keyBy(initialAnswers, 'questionId')
  const initialState: AppState = {
    answers: {
      answersById,
      focusedQuestionId: null,
      serverQuestionIds: initialQuestionIds,
      supportsAnswerHistory: typeof examServerApi.selectAnswerVersion === 'function',
      savedQuestionIds: initialQuestionIds,
      examStructure,
      validationErrors: validateAnswers(examStructure, answersById)
    },
    audio: {
      errors: {},
      nowPlaying: null,
      playbackTimes
    },
    cas: { casStatus }
  }
  const sagaMiddleware = createSagaMiddleware()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const composeEnhancers = ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as typeof compose) || compose
  const enhancers = composeEnhancers(applyMiddleware(sagaMiddleware))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const store = createStore(rootReducer, initialState, enhancers)
  sagaMiddleware.run(rootSaga, examServerApi)

  return store
}
