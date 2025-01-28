import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import { renderChildNodes } from '../../../src/components/exam/Exam'
import { ExamComponentWrapper } from '../utils/ExamComponentWrapper'
import parseExam from '../../../src/parser/parseExam'
import { queryAll } from '../../../src/dom-utils'
import Question from '../../../src/components/exam/Question'
import { AnnotationProvider } from '../../../src/components/context/AnnotationProvider'
import { ExamAnnotation, NewExamAnnotation } from '../../../src'

interface AnnotationsStoryProps {
  masteredExam: MasteringResult
  annotations?: ExamAnnotation[]
  onClickAnnotation?: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotationId: number) => void
  onSaveAnnotation?: { fn: (annotation: NewExamAnnotation, comment: string) => void; result?: string }
}

export const AnnotationsStory: React.FC<AnnotationsStoryProps> = ({
  masteredExam,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}) => {
  const doc = parseExam(masteredExam.xml, true)
  const [_question1, question2] = queryAll(doc.documentElement, 'question', false)
  return (
    <ExamComponentWrapper
      doc={doc}
      resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
    >
      <AnnotationProvider
        annotations={annotations}
        onClickAnnotation={onClickAnnotation}
        onSaveAnnotation={
          onSaveAnnotation
            ? (...args) => {
                onSaveAnnotation.fn(...args)
                return Promise.resolve(onSaveAnnotation.result)
              }
            : undefined
        }
      >
        <Question element={question2} renderChildNodes={renderChildNodes} />
      </AnnotationProvider>
    </ExamComponentWrapper>
  )
}
