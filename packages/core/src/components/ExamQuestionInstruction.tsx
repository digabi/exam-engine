import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'

function QuestionInstruction({ element, renderChildNodes }: ExamComponentProps) {
  return <div className="exam-question-instruction e-mrg-b-2">{renderChildNodes(element)}</div>
}

export default React.memo(QuestionInstruction)
