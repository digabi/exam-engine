import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { Score } from '../shared/Score'

const AutogradedAnswerOption: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const score = getNumericAttribute(element, 'score')
  if (!score) return null

  return (
    <li>
      {renderChildNodes(element)} <Score score={score} />
    </li>
  )
}

export default AutogradedAnswerOption
