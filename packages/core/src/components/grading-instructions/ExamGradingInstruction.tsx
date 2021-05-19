import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'

const ExamGradingInstruction: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  return <div className="e-exam-grading-instruction e-break-word notification e-pad-4">{renderChildNodes(element)}</div>
}

export default ExamGradingInstruction
