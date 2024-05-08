import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'

function ExamInstruction({ element, renderChildNodes }: ExamComponentProps) {
  return (
    <div className="exam-instruction notification e-pad-4" data-annotation-anchor="exam-instruction">
      {renderChildNodes(element)}
    </div>
  )
}

export default React.memo(ExamInstruction)
