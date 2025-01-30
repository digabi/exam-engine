import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import parseExam from '../../../../src/parser/parseExam'
import GradingInstructions from '../../../../src/components/grading-instructions/GradingInstructions'
import { ExamAnnotation, NewExamAnnotation } from '../../../../src'
import '../../../../src/css/main.less'

interface GradingInstructionsStoryProps {
  masteredExam: MasteringResult
  annotations?: ExamAnnotation[]
  onClickAnnotation?: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotationId: number) => void
  onSaveAnnotation?: (annotation: NewExamAnnotation, comment: string) => void
}

export const GradingInstructionStory: React.FC<GradingInstructionsStoryProps> = ({
  masteredExam,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}) => {
  const doc = parseExam(masteredExam.xml, true)
  return (
    <GradingInstructions
      doc={doc}
      resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
      answers={[]}
      attachmentsURL="/attachments"
      annotations={annotations}
      onClickAnnotation={onClickAnnotation}
      onSaveAnnotation={
        onSaveAnnotation ? (...args) => Promise.resolve(onSaveAnnotation(...args) ?? undefined) : undefined
      }
    />
  )
}
