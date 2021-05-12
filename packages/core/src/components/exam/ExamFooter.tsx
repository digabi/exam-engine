import React from 'react'
import SectionElement from '../SectionElement'
import { ExamComponentProps } from '../../createRenderChildNodes'

function ExamFooter({ element, renderChildNodes }: ExamComponentProps) {
  return <SectionElement>{renderChildNodes(element)}</SectionElement>
}

export default React.memo(ExamFooter)
