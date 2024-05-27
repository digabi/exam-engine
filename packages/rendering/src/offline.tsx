import { Attachments, Exam, GradingInstructions, ExamAnswer, parseExam } from '@digabi/exam-engine-core'
import React from 'react'
import { createRoot } from 'react-dom/client'
import '../public/offline.less'
import noopExamServerAPI from './utils/noopExamServerAPI'

const exam = process.env.EXAM!
const language = process.env.EXAM_LANGUAGE!
const isMediaVersion = !!process.env.MEDIA_VERSION

const doc = parseExam(exam, true)
const answers: ExamAnswer[] = []
const isAttachmentsPage = location.pathname.includes('attachments/')
const attachmentsURL = isAttachmentsPage ? '' : 'attachments/index.html'
const resolveAttachment = (filename: string) => {
  const actualFilename = !isMediaVersion ? filename : filename.replace(/\.webm$/, '.mp4').replace(/\.ogg$/, '.mp3')
  return (!isAttachmentsPage ? 'attachments/' : '') + encodeURIComponent(actualFilename)
}
const examServerApi = noopExamServerAPI(resolveAttachment)
const Root = isAttachmentsPage
  ? Attachments
  : location.pathname.includes('grading-instructions.html')
    ? GradingInstructions
    : Exam

const root = createRoot(document.getElementById('app')!)
root.render(
  <Root
    {...{
      answers,
      attachmentsURL,
      casStatus: 'forbidden',
      doc,
      examServerApi,
      language,
      resolveAttachment,
      restrictedAudioPlaybackStats: [],
      annotations: {},
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }}
  />
)
