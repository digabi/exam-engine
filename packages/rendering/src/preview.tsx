import { Attachments, Exam, parseExam, RestrictedAudioPlaybackStats, Results } from '@digabi/exam-engine-core'
import '@digabi/exam-engine-core/dist/main.css'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import Cookie from 'js-cookie'
import React from 'react'
import ReactDOM from 'react-dom'
import indexedDBExamServerAPI from './utils/indexedDBExamServerAPI'

// tslint:disable-next-line: no-var-requires
const { original, results }: { original: string; results: MasteringResult[] } = require(process.env.EXAM_FILENAME!)

function Toolbar({ hvp, languages, children }: { languages: string[]; hvp: string; children: React.ReactNode }) {
  return (
    <>
      <ol className="toolbar">
        {languages.map(language => (
          <ChangeLanguage language={language} key={language} />
        ))}
        <CopyHvp hvp={hvp} />
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

function CopyHvp({ hvp }: { hvp: string }) {
  return (
    <li className="toolbar__item">
      <button onClick={() => navigator.clipboard.writeText(hvp)}>Kopioi HVP</button>
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

  if (!language) {
    return
  }
  const { xml, hvp, gradingStructure } = results.find(r => r.language === language)!
  const doc = parseExam(xml, false)
  const attachmentsURL = '/attachments/'
  const resolveAttachment = (filename: string) => attachmentsURL + encodeURIComponent(filename)
  const examUuid = doc.documentElement.getAttribute('exam-uuid')!
  const examServerApi = indexedDBExamServerAPI(examUuid, resolveAttachment)

  const answers = await examServerApi.getAnswers()

  document.body.style.backgroundColor = backgroundColor()

  if (inResultsPage()) {
    ReactDOM.render(
      <Toolbar {...{ languages, selectedLanguage: language, hvp }}>
        <Results
          {...{
            doc,
            language,
            attachmentsURL,
            resolveAttachment,
            answers,
            gradingStructure
          }}
        />
      </Toolbar>,
      app
    )
  } else {
    const Root = inAttachmentsPage() ? Attachments : Exam
    const casCountdownDuration = Number(process.env.CAS_COUNTDOWN_DURATION_SECONDS) || undefined
    const restrictedAudioPlaybackStats: RestrictedAudioPlaybackStats[] = []

    const scrollKey = Root === Exam ? 'examScrollY' : 'attachmentsScrollY'
    window.addEventListener('beforeunload', () => localStorage.setItem(scrollKey, window.scrollY.toString()))

    document.body.style.backgroundColor = Root === Exam ? '#e0f4fe' : '#f0f0f0'

    ReactDOM.render(
      <Toolbar {...{ languages, selectedLanguage: language, hvp }}>
        <Root
          {...{
            casCountdownDuration,
            doc,
            language,
            attachmentsURL,
            resolveAttachment,
            answers,
            casStatus: 'forbidden',
            restrictedAudioPlaybackStats,
            examServerApi
          }}
        />
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
}

const backgroundColor = () => (inAttachmentsPage() ? '#f0f0f0' : '#e0f4fe')
const inResultsPage = () => location.pathname.startsWith('/results')
const inAttachmentsPage = () => location.pathname.startsWith('/attachments')
