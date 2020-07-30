import React, { useContext } from 'react'
import { QuestionContext } from './QuestionContext'
import { ExamComponentProps } from '../createRenderChildNodes'
import { questionTitleId } from '../ids'
import { formatQuestionDisplayNumber } from '../formatting'

function AttachmentsQuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial } = useContext(QuestionContext)

  return hasExternalMaterial ? (
    <h2 id={questionTitleId(displayNumber)}>
      {formatQuestionDisplayNumber(displayNumber)} {renderChildNodes(element)}
    </h2>
  ) : null
}

export default React.memo(AttachmentsQuestionTitle)
