import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'

const AnswerGradingInstruction: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  return (
    <div className="e-answer-grading-instruction e-multiline-results-text-answer e-mrg-b-2 e-pad-l-2">
      {renderChildNodes(element)}
    </div>
  )
}

export default AnswerGradingInstruction
