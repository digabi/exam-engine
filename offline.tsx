import React from 'react'
import ReactDOM from 'react-dom'
import { Attachments, Exam, parseExam } from './packages/exam-engine/src'
import './packages/exam-engine/src/css/main.less'
import noopExamServerAPI from './packages/exam-engine/src/utils/noopExamServerAPI'

const exam = require(process.env.EXAM_FILENAME!) // tslint:disable-line no-var-requires
const language = process.env.EXAM_LANGUAGE!

window.onload = async () => {
  const app = document.getElementById('app')!

  const doc = parseExam(exam, true)
  const resolveAttachment = (filename: string) => 'attachments/' + encodeURIComponent(filename)
  const examServerApi = noopExamServerAPI(resolveAttachment)
  const answers = await examServerApi.getAnswers()

  const attachmentsURL = 'aineisto.html'
  const Root = location.pathname.includes(attachmentsURL) ? Attachments : Exam

  document.body.style.backgroundColor = Root === Exam ? '#e0f4fe' : '#f0f0f0'

  ReactDOM.render(
    <Root
      {...{
        answers,
        attachmentsURL,
        casStatus: 'forbidden',
        doc,
        examServerApi,
        language,
        resolveAttachment,
        restrictedAudioPlaybackStats: []
      }}
    />,
    app
  )
}
