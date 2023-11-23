import React from 'react'
import { findChildElement, queryAncestors } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import TextAnswerInput from './internal/TextAnswerInput'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { ScreenReaderOnly } from '../ScreenReaderOnly'

function TextAnswer(props: ExamComponentProps) {
  const { element, renderChildNodes } = props
  const displayNumber = element.getAttribute('display-number')!
  const hint = findChildElement(element, 'hint')
  const textAnswer = <TextAnswerInput {...props} />

  const parentQuestion = queryAncestors(element, 'question')
  const siblings = parentQuestion?.querySelectorAll('[question-id]')
  const hasSiblingQuestions = siblings && siblings?.length > 1

  return hint ? (
    <label className="e-nowrap">
      {hasSiblingQuestions && (
        <sup className="e-text-answer-display-number e-color-darkgrey">{shortDisplayNumber(displayNumber)}</sup>
      )}
      <ScreenReaderOnly>{renderChildNodes(hint)}</ScreenReaderOnly>
      {textAnswer}
    </label>
  ) : (
    textAnswer
  )
}

export default React.memo(TextAnswer)
