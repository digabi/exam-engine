import { ExamAnswer } from '@digabi/exam-engine'
import Attachments from '@digabi/exam-engine/dist/components/Attachments'
import Exam from '@digabi/exam-engine/dist/components/Exam'
import parseExam from '@digabi/exam-engine/dist/parser/parseExam'
import '@digabi/exam-engine/src/css/main.less'
import React from 'react'
import ReactDOM from 'react-dom'
import noopExamServerAPI from './utils/noopExamServerAPI'

const exam = require(process.env.EXAM_FILENAME!) // tslint:disable-line no-var-requires
const language = process.env.EXAM_LANGUAGE!

window.onload = async () => {
  const app = document.getElementById('app')!

  const doc = parseExam(exam, true)
  const resolveAttachment = (filename: string) => 'attachments/' + encodeURIComponent(filename)
  const examServerApi = noopExamServerAPI(resolveAttachment)
  const answers: ExamAnswer[] = []

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
