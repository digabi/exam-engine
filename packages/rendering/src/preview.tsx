import {
  Attachments,
  Exam,
  ExamAnswer,
  ExamServerAPI,
  GradingInstructions,
  Results,
  parseExam
} from '@digabi/exam-engine-core'
import '@digabi/exam-engine-core/dist/main.css'
import { ExamType, MasteringResult } from '@digabi/exam-engine-mastering'
import React, { useEffect, useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Link, RouterProvider, useRoute, useRouter } from 'react-router5'
import createRouter from 'router5'
import browserPlugin from 'router5-plugin-browser'
import Grading from './PreviewGrading'
import indexedDBExamServerAPI from './utils/indexedDBExamServerAPI'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { original, results } = require(process.env.EXAM_FILENAME!) as { original: string; results: MasteringResult[] }

interface RouteParams {
  language: string
  type: ExamType
}

const routes = [
  { name: 'attachments', path: '/:language/:type/attachments' },
  { name: 'grading-instructions', path: '/:language/:type/grading-instructions' },
  { name: 'exam', path: '/:language/:type/exam' },
  { name: 'results', path: '/:language/:type/results' },
  { name: 'grading', path: '/:language/:type/grading' }
]

const router = createRouter(routes, {
  defaultRoute: 'exam',
  defaultParams: results
    ? { language: results[0].language, type: results[0].type }
    : { language: 'fi-FI', type: 'normal' }
})
router.usePlugin(browserPlugin())
router.start()

const resolveAttachment = (filename: string) => `/attachments/${encodeURIComponent(filename)}`

const findExam = (params: RouteParams): MasteringResult => {
  const result = results.find(r => r.language === params.language && r.type === params.type)
  if (!result) {
    throw new Error('Unable to find exam!')
  }
  return result
}

const ChangeExamVersion: React.FunctionComponent<RouteParams> = ({ language, type }) => {
  const { route } = useRoute()
  const title = `${language === 'fi-FI' ? '🇫🇮 FI' : '🇸🇪 SV'} ${
    type === 'normal' ? '' : type === 'visually-impaired' ? 'NV' : 'KV'
  }`
  return (
    <li className="toolbar__item toolbar__item--exam-version">
      {route.params.language === language && route.params.type === type ? (
        <span className="toolbar__item__selected">{title}</span>
      ) : (
        <Link routeName={route.name} routeParams={{ ...route.params, language, type }}>
          {title}
        </Link>
      )}
    </li>
  )
}

const SaveTranslation: React.FunctionComponent<{ translation: string; translationFilename: string }> = ({
  translation,
  translationFilename
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

const NavigateTo: React.FunctionComponent<{ routeName: string; title: string }> = ({ routeName, title }) => {
  const { route } = useRoute()
  return (
    <li className="toolbar__item">
      {route.name === routeName ? (
        <span className="toolbar__item__selected">{title}</span>
      ) : (
        <Link routeName={routeName} routeParams={route.params}>
          {title}
        </Link>
      )}
    </li>
  )
}

const Toolbar: React.FunctionComponent<{
  translation: string
  translationFilename: string
}> = ({ translation, translationFilename }) => (
  <div className="toolbar">
    <ol className="toolbar_inner" aria-hidden="true">
      {results.map(({ language, type }) => (
        <ChangeExamVersion {...{ language, type }} key={language + type} />
      ))}
      <SaveTranslation {...{ translation, translationFilename }} />
      <NavigateTo routeName="exam" title="Koe" />
      <NavigateTo routeName="attachments" title="Aineisto" />
      <NavigateTo routeName="results" title="Suorituskopio" />
      <NavigateTo routeName="grading-instructions" title="HVP" />
      <NavigateTo routeName="grading" title="Arvostelu" />
    </ol>
  </div>
)

const App: React.FunctionComponent<{
  examServerApi: ExamServerAPI
  answers: ExamAnswer[]
  resolveAttachment: (filename: string) => string
  callback: () => void
}> = ({ examServerApi, answers, resolveAttachment }) => {
  const router = useRouter()
  const { route } = useRoute()
  const { language, type } = route.params as RouteParams

  const { xml, translation, examCode, gradingStructure } = findExam({ language, type })
  const doc = useMemo(() => parseExam(xml, true), [xml])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    document.body.style.backgroundColor = route.name === 'attachments' ? '#f0f0f0' : '#e0f4fe'
  }, [route.name])

  const attachmentsURL = router.buildPath('attachments', route.params)
  const translationFilename = examCode ? `${examCode}_kaannokset.txt` : 'kaannokset.txt'

  const commonProps = {
    doc,
    attachmentsURL,
    resolveAttachment,
    answers
  }
  const resultsProps = {
    ...commonProps,
    gradingStructure,
    scores: [],
    isPreviewPage: true
  }
  const examProps = {
    ...commonProps,
    casCountdownDuration: Number(process.env.CAS_COUNTDOWN_DURATION_SECONDS) || undefined,
    casStatus: 'forbidden' as const,
    restrictedAudioPlaybackStats: [],
    examServerApi,
    type,
    studentName: '[Kokelaan Nimi]',
    allowLanguageChange: true,
    showUndoView: false,
    undoViewProps: {
      questionId: 0,
      title: '',
      close: () => undefined,
      restoreAnswer: () => undefined
    }
  }

  const gradingInstructionProps = {
    ...commonProps,
    ...(process.env.EDITABLE_GRADING_INSTRUCTIONS
      ? { EditorComponent: (props: { element: Element }) => <ElementRenderer element={props.element} /> }
      : {})
  }
  return (
    <div ref={callback}>
      <Toolbar {...{ translation, translationFilename }} />
      {route.name === 'results' ? (
        <Results {...resultsProps} />
      ) : route.name === 'attachments' ? (
        <Attachments {...examProps} />
      ) : route.name === 'grading-instructions' ? (
        <GradingInstructions key={`${examCode}-${language}-${type}`} {...commonProps} {...gradingInstructionProps} />
      ) : route.name === 'grading' ? (
        <Grading {...resultsProps} />
      ) : (
        <Exam {...examProps} />
      )}
    </div>
  )
}

const callback = () => {
  document.getElementById('app')!.removeAttribute('aria-busy')
  const maybeScrollY = localStorage.getItem(location.pathname)
  localStorage.removeItem(location.pathname)
  if (maybeScrollY) {
    requestAnimationFrame(() => {
      window.scrollTo(0, Number(maybeScrollY))
    }) // Delay scrolling a bit to wait for the layout to stabilize.
  }
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

  const root = createRoot(app)
  root.render(
    <RouterProvider router={router}>
      <App {...{ examServerApi, answers, resolveAttachment, callback }} />
    </RouterProvider>
  )
}

function ElementRenderer({ element }: { element: Element }) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current && element) {
      elementRef.current.appendChild(element)
    }

    return () => {
      if (elementRef.current && elementRef.current.contains(element)) {
        elementRef.current.removeChild(element)
      }
    }
  }, [element])

  return <div ref={elementRef}></div>
}
