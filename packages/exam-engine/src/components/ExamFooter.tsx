import React from 'react'
import Section from './Section'
import { ExamComponentProps } from './types'

function ExamFooter({ element, renderChildNodes }: ExamComponentProps) {
  return <Section>{renderChildNodes(element)}</Section>
}

export default React.memo(ExamFooter)
