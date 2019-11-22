import Cookie from 'js-cookie'
import React from 'react'
import ReactDOM from 'react-dom'
import { Attachments, Exam, parseExam, RestrictedAudioPlaybackStats } from './packages/exam-engine/src'
import './packages/exam-engine/src/css/main.less'
import indexedDBExamServerAPI from './packages/exam-engine/src/utils/indexedDBExamServerAPI'

const exams = require(process.env.EXAM_FILENAME!) // tslint:disable-line no-var-requires

function LanguageSelector({ languages, children }: { languages: string[]; children: React.ReactNode }) {
  return (
    <>
      <ol className="language-selector">
        {languages.map(language => (
          <Language language={language} key={language} />
        ))}
      </ol>
      {children}
    </>
  )
}

function Language({ language }: { language: string }) {
  const onClick = () => {
    Cookie.set('language', language)
    window.location.reload()
  }
  return (
    <li className="language-selector__language">
      <a onClick={onClick} href="">
        {language}
      </a>
    </li>
  )
}

window.onload = async () => {
  const app = document.getElementById('app')!

  const languages = Object.keys(exams.mastered)
  const languageCookie = Cookie.get('language')
  const language = languages.find(lang => lang === languageCookie) || languages[0]
  const deterministicRendering = !!process.env.DETERMINISTIC_RENDERING

  if (language) {
    const doc = parseExam(exams.mastered[language], deterministicRendering)

    const Root = location.pathname.startsWith('/attachments') ? Attachments : Exam
    const attachmentsURL = '/attachments/'
    const resolveAttachment = (filename: string) => '/attachments/' + encodeURIComponent(filename)

    const examUuid = doc.documentElement.getAttribute('exam-uuid')!
    const examServerApi = indexedDBExamServerAPI(examUuid, resolveAttachment)
    const answers = await examServerApi.getAnswers()
    const restrictedAudioPlaybackStats: RestrictedAudioPlaybackStats[] = []

    const scrollKey = Root === Exam ? 'examScrollY' : 'attachmentsScrollY'
    window.addEventListener('beforeunload', () => localStorage.setItem(scrollKey, window.scrollY.toString()))

    document.body.style.backgroundColor = Root === Exam ? '#e0f4fe' : '#f0f0f0'

    ReactDOM.render(
      <LanguageSelector {...{ languages, selectedLanguage: language }}>
        <Root
          {...{
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
      </LanguageSelector>,
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
  } else {
    const sourceDoc = parseExam(exams.original, deterministicRendering)
    const root = document.importNode(sourceDoc.documentElement, true)
    app.appendChild(root)
  }
}
