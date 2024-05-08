import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'

const ExamGradingInstruction: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => (
  <div className="e-exam-grading-instruction notification e-pad-4" data-annotation-anchor="exam-grading-instruction">
    {renderChildNodes(element)}
  </div>
)

export default ExamGradingInstruction
