import { ExamAnswer } from '@digabi/exam-engine'
import Attachments from '@digabi/exam-engine/dist/components/Attachments'
import Exam from '@digabi/exam-engine/dist/components/Exam'
import parseExam from '@digabi/exam-engine/dist/parser/parseExam'
import React from 'react'
import ReactDOM from 'react-dom'
import '../public/offline.less'
import noopExamServerAPI from './utils/noopExamServerAPI'

const exam = process.env.EXAM!
const language = process.env.EXAM_LANGUAGE!

const doc = parseExam(exam, true)
const answers: ExamAnswer[] = []
const isExamPage = !location.pathname.includes('/attachments')
const attachmentsURL = isExamPage ? 'attachments/index.html' : ''
const resolveAttachment = (filename: string) => (isExamPage ? 'attachments/' : '') + encodeURIComponent(filename)
const examServerApi = noopExamServerAPI(resolveAttachment)
const Root = isExamPage ? Exam : Attachments

const prerendered = document.body.children.length > 0
const render = prerendered ? ReactDOM.hydrate : ReactDOM.render

render(
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
  document.body
)
