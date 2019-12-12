import React from 'react'
import { ExamComponentProps } from './types'

function SectionInstruction({ element, renderChildNodes }: ExamComponentProps) {
  return <div className="e-mrg-b-2">{renderChildNodes(element)}</div>
}

export default React.memo(SectionInstruction)
