import { Attachments, Exam, ExamAnswer, parseExam } from '@digabi/exam-engine-core'
import React from 'react'
import { render } from 'react-dom'
import '../public/offline.less'
import noopExamServerAPI from './utils/noopExamServerAPI'

const exam = process.env.EXAM!
const language = process.env.EXAM_LANGUAGE!
const isMediaVersion = !!process.env.MEDIA_VERSION

const doc = parseExam(exam, true)
const answers: ExamAnswer[] = []
const isExamPage = !location.pathname.includes('/attachments')
const attachmentsURL = isExamPage ? 'attachments/index.html' : ''
const resolveAttachment = (filename: string) => {
  const actualFilename = !isMediaVersion ? filename : filename.replace(/\.webm$/, '.mp4').replace(/\.ogg$/, '.mp3')
  return (isExamPage ? 'attachments/' : '') + encodeURIComponent(actualFilename)
}
const examServerApi = noopExamServerAPI(resolveAttachment)
const Root = isExamPage ? Exam : Attachments

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
