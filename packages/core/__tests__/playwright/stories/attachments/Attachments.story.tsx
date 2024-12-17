import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import parseExam from '../../../../src/parser/parseExam'
import Attachments from '../../../../src/components/attachments/Attachments'
import { ExamAnnotation, NewExamAnnotation, RenderableAnnotation } from '../../../../src'
import { examServerApi } from '../../../examServerApi'
import '../../../../src/css/main.less'

interface AttachmentsStoryProps {
  masteredExam: MasteringResult
  annotations?: ExamAnnotation[]
  onClickAnnotation?: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotation: RenderableAnnotation) => void
  onSaveAnnotation?: (annotation: NewExamAnnotation, comment: string) => void
}

export const AttachmentsStory: React.FC<AttachmentsStoryProps> = ({
  masteredExam,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}) => {
  const doc = parseExam(masteredExam.xml, true)
  return (
    <Attachments
      doc={doc}
      resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
      attachmentsURL="/attachments"
      annotations={annotations}
      onClickAnnotation={onClickAnnotation}
      onSaveAnnotation={onSaveAnnotation}
      examServerApi={examServerApi}
    />
  )
}
