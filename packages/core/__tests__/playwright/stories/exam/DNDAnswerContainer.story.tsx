import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import { renderChildNodesBase } from '../../../../src/components/exam/Exam'
import { DNDAnswerContainer } from '../../../../src/components/exam/DNDAnswerContainer'
import { ExamComponentWrapper } from '../../utils/ExamComponentWrapper'
import parseExam from '../../../../src/parser/parseExam'
import { queryAll } from '../../../../src/dom-utils'

export type answerMediaType = 'text' | 'image'

interface DNDAnswerContainerStoryProps {
  masteredExam: MasteringResult
  answerMediaType: answerMediaType
}

export const DNDAnswerContainerStory: React.FC<DNDAnswerContainerStoryProps> = ({ masteredExam, answerMediaType }) => {
  const doc = parseExam(masteredExam.xml, true)
  const [textAnswers, imageAnswers] = queryAll(doc.documentElement, 'dnd-answer-container')
  return (
    <ExamComponentWrapper
      doc={doc}
      resolveAttachment={(filename: string) => `/${masteredExam.examCode}/attachments/${filename}`}
    >
      <DNDAnswerContainer
        element={answerMediaType === 'text' ? textAnswers : imageAnswers}
        renderChildNodes={renderChildNodesBase()}
        renderComponentOverrides={{}}
      ></DNDAnswerContainer>
    </ExamComponentWrapper>
  )
}
