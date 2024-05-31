import React, { useContext } from 'react'
import { QuestionContext } from '../context/QuestionContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { questionTitleId } from '../../ids'
import { formatQuestionDisplayNumber } from '../../formatting'

function QuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial } = useContext(QuestionContext)

  return hasExternalMaterial ? (
    <>
      <div className="anchor" id={`question-nr-${displayNumber}`} />
      <h2 id={questionTitleId(displayNumber)}>
        {formatQuestionDisplayNumber(displayNumber)} {renderChildNodes(element)}
      </h2>
    </>
  ) : null
}

export default React.memo(QuestionTitle)
