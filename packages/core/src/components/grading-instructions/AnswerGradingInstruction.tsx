import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { GradingInstructionContext } from '../context/GradingInstructionContext'

const AnswerGradingInstruction: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { EditorComponent } = useContext(GradingInstructionContext)

  return (
    <div className="e-answer-grading-instruction e-multiline-results-text-answer e-mrg-b-2 e-pad-l-2">
      {EditorComponent ? <EditorComponent element={element} /> : renderChildNodes(element)}
    </div>
  )
}

export default AnswerGradingInstruction
