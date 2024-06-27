import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, hasSiblingQuestions } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { ScreenReaderOnly } from '../ScreenReaderOnly'
import TextAnswerInput from './internal/TextAnswerInput'

function TextAnswer(props: ExamComponentProps) {
  const { element, renderChildNodes } = props
  const displayNumber = element.getAttribute('display-number')!
  const hint = findChildElement(element, 'hint')
  const textAnswer = <TextAnswerInput {...props} />

  const hasSiblings = hasSiblingQuestions(element)

  return (
    <>
      <span className="anchor" id={`question-nr-${displayNumber}`} />
      {hint ? (
        <label className="e-nowrap">
          {hasSiblings && (
            <sup className="e-text-answer-display-number e-color-darkgrey">{shortDisplayNumber(displayNumber)}</sup>
          )}
          <ScreenReaderOnly>{renderChildNodes(hint)}</ScreenReaderOnly>
          {textAnswer}
        </label>
      ) : (
        textAnswer
      )}
    </>
  )
}

export default React.memo(TextAnswer)
