/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react'
import { MasteringResult } from '@digabi/exam-engine-mastering'
import { renderChildNodes } from '../../../src/components/exam/Exam'
import { DNDAnswerContainer } from '../../../src/components/exam/DNDAnswerContainer'
import { ComponentWrapper } from '../utils/ComponentWrapper'
import parseExam from '../../../src/parser/parseExam'
import { query } from '../../../src/dom-utils'

interface DNDAnswerContainerStoryProps {
  masteredExam: MasteringResult[]
  exam: string
}

export const DNDAnswerContainerStory: React.FC<DNDAnswerContainerStoryProps> = ({ masteredExam, exam }) => {
  const doc = parseExam(masteredExam[0].xml, true)
  const element = query(doc.documentElement, 'dnd-answer-container')!
  return (
    <ComponentWrapper exam={exam}>
      <DNDAnswerContainer element={element} renderChildNodes={renderChildNodes}></DNDAnswerContainer>
    </ComponentWrapper>
  )
}
