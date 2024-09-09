import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import EditableGradingInstruction from './EditableGradingInstruction'

const ExamGradingInstruction: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { editable } = useContext(GradingInstructionContext)

  return (
    <div className="e-exam-grading-instruction notification e-pad-4" data-annotation-anchor="exam-grading-instruction">
      {editable ? <EditableGradingInstruction element={element} /> : renderChildNodes(element)}
    </div>
  )
}
export default ExamGradingInstruction
