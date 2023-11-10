import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'

function ExamFooter({ element, renderChildNodes }: ExamComponentProps) {
  return <div className="e-exam-footer">{renderChildNodes(element)}</div>
}

export default React.memo(ExamFooter)
