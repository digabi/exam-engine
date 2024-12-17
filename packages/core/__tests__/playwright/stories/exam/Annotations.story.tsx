import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import { renderChildNodes } from '../../../../src/components/exam/Exam'
import { ExamComponentWrapper } from '../../utils/ExamComponentWrapper'
import parseExam from '../../../../src/parser/parseExam'
import { queryAll } from '../../../../src/dom-utils'
import Question from '../../../../src/components/exam/Question'
import { AnnotationProvider } from '../../../../src/components/context/AnnotationProvider'

interface AnnotationsStoryProps {
  masteredExam: MasteringResult
}

export const AnnotationsStory: React.FC<AnnotationsStoryProps> = ({ masteredExam }) => {
  const doc = parseExam(masteredExam.xml, true)
  const [_question1, question2] = queryAll(doc.documentElement, 'question', false)
  return (
    <ExamComponentWrapper
      doc={doc}
      resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
    >
      <AnnotationProvider annotations={[]} onClickAnnotation={() => {}} onSaveAnnotation={() => {}}>
        <Question element={question2} renderChildNodes={renderChildNodes} />
      </AnnotationProvider>
    </ExamComponentWrapper>
  )
}
