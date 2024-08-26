import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import EditableGradingInstruction from './EditableGradingInstruction'

const AnswerGradingInstruction: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { editable } = useContext(GradingInstructionContext)
  return (
    <div className="e-answer-grading-instruction e-multiline-results-text-answer e-mrg-b-2 e-pad-l-2">
      {editable ? (
        <EditableGradingInstruction element={element} renderChildNodes={renderChildNodes} />
      ) : (
        renderChildNodes(element)
      )}
    </div>
  )
}

export default AnswerGradingInstruction
