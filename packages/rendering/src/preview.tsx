import { Attachments, Exam, Results, parseExam, ExamAnswer, ExamServerAPI } from '@digabi/exam-engine-core'
import '@digabi/exam-engine-core/dist/main.css'
import { ExamType, MasteringResult } from '@digabi/exam-engine-mastering'
import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import indexedDBExamServerAPI from './utils/indexedDBExamServerAPI'
import createRouter from 'router5'
import { RouterProvider, useRoute, useRouter } from 'react-router5'
import browserPlugin from 'router5-plugin-browser'

const { original, results } = require(process.env.EXAM_FILENAME!) as { original: string; results: MasteringResult[] }

interface RouteParams {
  language: string
  type: ExamType
}

const routes = [
  { name: 'attachments', path: '/:language/:type/attachments' },
  { name: 'results', path: '/:language/:type/results' },
  { name: 'exam', path: '/:language/:type' },
]

const router = createRouter(routes, {
  defaultRoute: 'exam',
  defaultParams: results
    ? { language: results[0].language, type: results[0].type }
    : { language: 'fi-FI', type: 'normal' },
})
router.usePlugin(browserPlugin())
router.start()

const resolveAttachment = (filename: string) => `/attachments/${encodeURIComponent(filename)}`

const findExam = (params: RouteParams): MasteringResult => {
  const result = results.find((r) => r.language === params.language && r.type === params.type)
  if (!result) {
    throw new Error('Unable to find exam!')
  }
  return result
}

const ChangeExamVersion: React.FunctionComponent<RouteParams> = ({ language, type }) => {
  const router = useRouter()
  const { route } = useRoute()
  return (
    <li className="toolbar__item toolbar__item--exam-version">
      <button onClick={() => router.navigate(route.name, { ...route.params, language, type })}>
        {language === 'fi-FI' ? '🇫🇮' : '🇸🇪'} {language === 'fi-FI' ? 'Suomi' : 'Ruotsi'}{' '}
        {type === 'normal' ? '' : type === 'visually-impaired' ? '(Näkövammaiset)' : '(Kuulovammaiset)'}
      </button>
    </li>
  )
}

const SaveHvp: React.FunctionComponent<{ hvp: string; hvpFilename: string }> = ({ hvp, hvpFilename }) => (
  <li className="toolbar__item">
    <button
      onClick={() => {
        const blob = new Blob([hvp], { type: 'text/markdown' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = hvpFilename
        link.click()
      }}
    >
      Tallenna HVP
    </button>
  </li>
)

const SaveTranslation: React.FunctionComponent<{ translation: string; translationFilename: string }> = ({
  translation,
  translationFilename,
}) => (
  <li className="toolbar__item">
    <button
      onClick={() => {
        const blob = new Blob([translation], { type: 'text/plain' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = translationFilename
        link.click()
      }}
    >
      Tallenna käännettävät tekstit
    </button>
  </li>
)

const ResultsNavigation: React.FunctionComponent = () => {
  const router = useRouter()
  const { route } = useRoute()
  const txt = route.name === 'exam' ? 'Tulossivu' : 'Kokeen suoritus'
  return (
    <li className="toolbar__item">
      <button onClick={() => router.navigate(route.name === 'exam' ? 'results' : 'exam', route.params)}>{txt}</button>
    </li>
  )
}

const Toolbar: React.FunctionComponent<{
  hvp: string
  hvpFilename: string
  translation: string
  translationFilename: string
}> = ({ hvp, hvpFilename, translation, translationFilename }) => (
  <div className="toolbar">
    <ol className="toolbar_inner" aria-hidden="true">
      {results.map(({ language, type }) => (
        <ChangeExamVersion {...{ language, type }} key={language + type} />
      ))}
      <SaveHvp {...{ hvp, hvpFilename }} />
      <SaveTranslation {...{ translation, translationFilename }} />
      <ResultsNavigation />
    </ol>
  </div>
)

const App: React.FunctionComponent<{
  examServerApi: ExamServerAPI
  answers: ExamAnswer[]
  resolveAttachment: (filename: string) => string
}> = ({ examServerApi, answers, resolveAttachment }) => {
  const router = useRouter()
  const { route } = useRoute()
  const { language, type } = route.params as RouteParams

  const { xml, hvp, translation, examCode, dayCode, gradingStructure } = findExam({ language, type })
  const doc = useMemo(() => parseExam(xml, true), [xml])

  useEffect(() => {
    document.body.style.backgroundColor = route.name === 'attachments' ? '#f0f0f0' : '#e0f4fe'
  }, [route.name])

  const attachmentsURL = router.buildPath('attachments', route.params)
  const hvpFilename = examCode ? `${examCode}${dayCode ? '_' + dayCode : ''}_${language}.md` : 'hvp.md'
  const translationFilename = examCode ? `${examCode}_kaannokset.txt` : 'kaannokset.txt'

  const commonProps = {
    doc,
    attachmentsURL,
    resolveAttachment,
    answers,
  }
  const resultsProps = {
    ...commonProps,
    gradingStructure,
    scores: [],
  }
  const examProps = {
    ...commonProps,
    casCountdownDuration: Number(process.env.CAS_COUNTDOWN_DURATION_SECONDS) || undefined,
    casStatus: 'forbidden' as const,
    restrictedAudioPlaybackStats: [],
    examServerApi,
  }

  return (
    <>
      <Toolbar {...{ hvp, hvpFilename, translation, translationFilename }} />
      {route.name === 'results' ? (
        <Results {...resultsProps} />
      ) : route.name === 'attachments' ? (
        <Attachments {...examProps} />
      ) : (
        <Exam {...examProps} />
      )}
    </>
  )
}

onload = async () => {
  const app = document.getElementById('app')!

  if (!results) {
    const sourceDoc = parseExam(original, true)
    const root = document.importNode(sourceDoc.documentElement, true)
    return app.appendChild(root)
  }
  const { params } = router.getState()
  const { examUuid } = findExam(params as RouteParams)
  const examServerApi = indexedDBExamServerAPI(examUuid, resolveAttachment)
  const answers = await examServerApi.getAnswers()

  // Set the initial URL
  if (location.pathname === '/') {
    const [{ language, type }] = results
    history.replaceState(null, '', `/${language}/${type}`)
  }

  // Save scroll position when reloading the page
  window.addEventListener('beforeunload', () => {
    localStorage.setItem(location.pathname, window.scrollY.toString())
  })

  ReactDOM.render(
    <RouterProvider router={router}>
      <App {...{ examServerApi, answers, resolveAttachment }} />
    </RouterProvider>,
    app,
    () => {
      app.removeAttribute('aria-busy')
      const maybeScrollY = localStorage.getItem(location.pathname)
      localStorage.removeItem(location.pathname)
      if (maybeScrollY) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(maybeScrollY))
        }) // Delay scrolling a bit to wait for the layout to stabilize.
      }
    }
  )
}
