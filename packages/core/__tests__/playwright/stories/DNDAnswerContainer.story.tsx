import React from 'react'
import { renderChildNodes } from '../../../src/components/exam/Exam'
import { DNDAnswerContainer } from '../../../src/components/exam/DNDAnswerContainer'
import { ComponentWrapper } from '../utils/ComponentWrapper'

interface DNDAnswerContainerStoryProps {
  content: string
  exam: string
}

export const DNDAnswerContainerStory: React.FC<DNDAnswerContainerStoryProps> = ({ content, exam }) => {
  const parser = new DOMParser()
  const element = parser.parseFromString(content, 'application/xml').documentElement
  return (
    <ComponentWrapper exam={exam}>
      <DNDAnswerContainer element={element} renderChildNodes={renderChildNodes}></DNDAnswerContainer>
    </ComponentWrapper>
  )
}
