import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import Exam, { renderChildNodes } from '../../../../src/components/exam/Exam'
import { ExamComponentWrapper } from '../../utils/ExamComponentWrapper'
import parseExam from '../../../../src/parser/parseExam'
import { ExamAnnotation, NewExamAnnotation, RenderableAnnotation } from '../../../../src'
import { examServerApi } from '../../../examServerApi'

interface ExamStoryProps {
  masteredExam: MasteringResult
  annotations?: ExamAnnotation[]
  onClickAnnotation?: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotation: RenderableAnnotation) => void
  onSaveAnnotation?: (annotation: NewExamAnnotation, comment: string) => void
}

export const ExamStory: React.FC<ExamStoryProps> = ({
  masteredExam,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}) => {
  const doc = parseExam(masteredExam.xml, true)
  return (
    <ExamComponentWrapper
      doc={doc}
      resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
    >
      <Exam
        doc={doc}
        renderChildNodes={renderChildNodes}
        annotations={annotations}
        onClickAnnotation={onClickAnnotation}
        onSaveAnnotation={onSaveAnnotation}
        resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
        answers={[]}
        attachmentsURL="/attachments"
        casStatus="forbidden"
        examServerApi={examServerApi}
        studentName="[Kokelaan Nimi]"
        showUndoView={false}
        undoViewProps={{
          questionId: 0,
          title: '',
          close: () => undefined,
          restoreAnswer: () => undefined
        }}
      />
    </ExamComponentWrapper>
  )
}
