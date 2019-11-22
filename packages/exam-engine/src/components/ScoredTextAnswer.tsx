import React from 'react'
import { findChildElementByLocalName, getNumericAttribute } from '../dom-utils'
import TextAnswer from './TextAnswer'
import { ExamComponentProps } from './types'

function ScoredTextAnswer(props: ExamComponentProps) {
  const { element, renderChildNodes } = props
  const displayNumber = getNumericAttribute(element, 'display-number')!
  const hint = findChildElementByLocalName(element, 'hint')
  const textAnswer = <TextAnswer {...props} />

  return hint ? (
    <label className="e-nowrap">
      <sup className="e-color-darkgrey">{displayNumber}.</sup>
      <span className="e-screen-reader-only">{renderChildNodes(hint)}</span> {textAnswer}
    </label>
  ) : (
    textAnswer
  )
}

export default React.memo(ScoredTextAnswer)
