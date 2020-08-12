import React from 'react'
import { findChildElement } from '../dom-utils'
import { shortDisplayNumber } from '../shortDisplayNumber'
import TextAnswerInput from './TextAnswerInput'
import { ExamComponentProps } from '../createRenderChildNodes'
import { ScreenReaderOnly } from './ScreenReaderOnly'

function TextAnswer(props: ExamComponentProps) {
  const { element, renderChildNodes } = props
  const displayNumber = element.getAttribute('display-number')!
  const hint = findChildElement(element, 'hint')
  const textAnswer = <TextAnswerInput {...props} />

  return hint ? (
    <label className="e-nowrap">
      <sup className="e-text-answer-display-number e-color-darkgrey">{shortDisplayNumber(displayNumber)}</sup>
      <ScreenReaderOnly>{renderChildNodes(hint)}</ScreenReaderOnly>
      {textAnswer}
    </label>
  ) : (
    textAnswer
  )
}

export default React.memo(TextAnswer)
