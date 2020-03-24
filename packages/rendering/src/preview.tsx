import Attachments from '@digabi/exam-engine-core/dist/components/Attachments'
import Exam from '@digabi/exam-engine-core/dist/components/Exam'
import Results from '@digabi/exam-engine-core/dist/components/results/Results'
import '@digabi/exam-engine-core/dist/main.css'
import parseExam from '@digabi/exam-engine-core/dist/parser/parseExam'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import Cookie from 'js-cookie'
import React from 'react'
import ReactDOM from 'react-dom'
import indexedDBExamServerAPI from './utils/indexedDBExamServerAPI'

// tslint:disable-next-line: no-var-requires
const { original, results }: { original: string; results: MasteringResult[] } = require(process.env.EXAM_FILENAME!)

function Toolbar({
  hvp,
  hvpFilename,
  translation,
  translationFilename,
  languages,
  children
}: {
  languages: string[]
  hvp: string
  hvpFilename: string
  translation: string
  translationFilename: string
  children: React.ReactNode
}) {
  return (
    <>
      <ol className="toolbar">
        {languages.map(language => (
          <ChangeLanguage language={language} key={language} />
        ))}
        <SaveHvp {...{ hvp, hvpFilename }} />
        <SaveTranslation {...{ translation, translationFilename }} />
        <ResultsNavigation />
      </ol>
      {children}
    </>
  )
}

function ChangeLanguage({ language }: { language: string }) {
  const onClick = () => {
    Cookie.set('language', language)
    window.location.reload()
  }
  return (
    <li className="toolbar__item toolbar__item--language">
      <button onClick={onClick}>{language}</button>
    </li>
  )
}

function SaveHvp({ hvp, hvpFilename }: { hvp: string; hvpFilename: string }) {
  return (
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
}
function SaveTranslation({ translation, translationFilename }: { translation: string; translationFilename: string }) {
  return (
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
}

function ResultsNavigation() {
  const isInResults = inResultsPage()
  const toUrl = isInResults ? '/' : '/results'
  const txt = isInResults ? 'Kokeen suoritus' : 'Tulossivu'
  return (
    <li className="toolbar__item">
      <button onClick={() => (location.href = toUrl)}>{txt}</button>
    </li>
  )
}

window.onload = async () => {
  const app = document.getElementById('app')!

  if (!results) {
    const sourceDoc = parseExam(original, false)
    const root = document.importNode(sourceDoc.documentElement, true)
    return app.appendChild(root)
  }

  const languages = results.map(r => r.language)
  const languageCookie = Cookie.get('language')
  const language = languages.find(lang => lang === languageCookie) || languages[0]

  const { xml, hvp, translation, examCode, dayCode, gradingStructure } = results.find(r => r.language === language)!
  const hvpFilename = examCode ? `${examCode}${dayCode ? '_' + dayCode : ''}_${language}.md` : 'hvp.md'
  const translationFilename = examCode ? `${examCode}_kaannokset.txt` : 'kaannokset.txt'
  const doc = parseExam(xml, false)
  const attachmentsURL = '/attachments/'
  const resolveAttachment = (filename: string) => attachmentsURL + encodeURIComponent(filename)
  const examUuid = doc.documentElement.getAttribute('exam-uuid')!
  const examServerApi = indexedDBExamServerAPI(examUuid, resolveAttachment)
  const answers = await examServerApi.getAnswers()

  document.body.style.backgroundColor = backgroundColor()

  const scrollKey = inResultsPage() ? 'resultsScrollY' : inAttachmentsPage() ? 'attachmentsScrollY' : 'examScrollY'
  window.addEventListener('beforeunload', () => localStorage.setItem(scrollKey, window.scrollY.toString()))

  const commonProps = {
    doc,
    language,
    attachmentsURL,
    resolveAttachment,
    answers
  }

  const Root = inAttachmentsPage() ? Attachments : Exam
  const content = inResultsPage() ? (
    <Results
      {...{
        ...commonProps,
        gradingStructure,
        scores: []
      }}
    />
  ) : (
    <Root
      {...{
        ...commonProps,
        casCountdownDuration: Number(process.env.CAS_COUNTDOWN_DURATION_SECONDS) || undefined,
        casStatus: 'forbidden',
        restrictedAudioPlaybackStats: [],
        examServerApi
      }}
    />
  )

  ReactDOM.render(
    <Toolbar {...{ languages, selectedLanguage: language, hvp, hvpFilename, translation, translationFilename }}>
      {content}
    </Toolbar>,
    app,
    () => {
      const maybeScrollY = localStorage.getItem(scrollKey)
      localStorage.removeItem(scrollKey)
      if (maybeScrollY) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(maybeScrollY))
        }) // Delay scrolling a bit to wait for the layout to stabilize.
      }
    }
  )
}

const backgroundColor = () => (inAttachmentsPage() ? '#f0f0f0' : '#e0f4fe')
const inResultsPage = () => location.pathname.startsWith('/results')
const inAttachmentsPage = () => location.pathname.startsWith('/attachments')
