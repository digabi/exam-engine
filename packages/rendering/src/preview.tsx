import { Attachments, Exam, parseExam, RestrictedAudioPlaybackStats } from '@digabi/exam-engine-core'
import '@digabi/exam-engine-core/dist/main.css'
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
  languages,
  children
}: {
  languages: string[]
  hvp: string
  hvpFilename: string
  children: React.ReactNode
}) {
  return (
    <>
      <ol className="toolbar">
        {languages.map(language => (
          <ChangeLanguage language={language} key={language} />
        ))}
        <SaveHvp {...{ hvp, hvpFilename }} />
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

  if (language) {
    const { xml, hvp, examCode, dayCode } = results.find(r => r.language === language)!
    const hvpFilename = examCode ? `${examCode}${dayCode ? '_' + dayCode : ''}_${language}.md` : 'hvp.md'
    const doc = parseExam(xml, false)

    const Root = location.pathname.startsWith('/attachments') ? Attachments : Exam
    const attachmentsURL = '/attachments/'
    const casCountdownDuration = Number(process.env.CAS_COUNTDOWN_DURATION_SECONDS) || undefined
    const resolveAttachment = (filename: string) => '/attachments/' + encodeURIComponent(filename)

    const examUuid = doc.documentElement.getAttribute('exam-uuid')!
    const examServerApi = indexedDBExamServerAPI(examUuid, resolveAttachment)
    const answers = await examServerApi.getAnswers()
    const restrictedAudioPlaybackStats: RestrictedAudioPlaybackStats[] = []

    const scrollKey = Root === Exam ? 'examScrollY' : 'attachmentsScrollY'
    window.addEventListener('beforeunload', () => localStorage.setItem(scrollKey, window.scrollY.toString()))

    document.body.style.backgroundColor = Root === Exam ? '#e0f4fe' : '#f0f0f0'

    ReactDOM.render(
      <Toolbar {...{ languages, selectedLanguage: language, hvp, hvpFilename }}>
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
