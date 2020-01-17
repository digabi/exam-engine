import React from 'react'
import { findChildElement } from '../dom-utils'
import TextAnswerInput from './TextAnswerInput'
import { ExamComponentProps } from './types'

function TextAnswer(props: ExamComponentProps) {
  const { element, renderChildNodes } = props
  const displayNumber = element.getAttribute('display-number')!
  const hint = findChildElement(element, 'hint')
  const textAnswer = <TextAnswerInput {...props} />

  return hint ? (
    <label className="e-nowrap">
      <sup className="e-color-darkgrey">{displayNumber}</sup>
      <span className="e-screen-reader-only">{renderChildNodes(hint)}</span> {textAnswer}
    </label>
  ) : (
    textAnswer
  )
}

export default React.memo(TextAnswer)
