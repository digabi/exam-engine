import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { questionInstructionId } from '../../ids'

function QuestionInstruction({ element, renderChildNodes }: ExamComponentProps) {
  const id = questionInstructionId(element)
  return (
    <div className="exam-question-instruction e-mrg-b-2" id={id}>
      {renderChildNodes(element)}
    </div>
  )
}

export default React.memo(QuestionInstruction)
