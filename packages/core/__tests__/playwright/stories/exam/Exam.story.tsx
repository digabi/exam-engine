import { MasteringResult } from '@digabi/exam-engine-mastering'
import React from 'react'
import { Exam } from '../../../../src'
import { examServerApi } from '../../../examServerApi'

interface ExamStoryProps {
  masteredExam: MasteringResult
}

export const ExamStory: React.FC<ExamStoryProps> = ({ masteredExam }) => {
  const doc = new DOMParser().parseFromString(masteredExam.xml, 'application/xml')
  return (
    <Exam
      {...{
        attachmentsURL: '/attachments',
        resolveAttachment: (filename: string) => `/${masteredExam.examCode}/attachments/${filename}`,
        doc,
        examServerApi
      }}
    />
  )
}
