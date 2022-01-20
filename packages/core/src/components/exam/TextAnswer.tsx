import React, { useContext } from 'react'
import { findChildElement } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import TextAnswerInput from './internal/TextAnswerInput'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { ScreenReaderOnly } from '../ScreenReaderOnly'
import { QuestionContext } from '../context/QuestionContext'
import { answerLengthInfoId } from '../../ids'

function TextAnswer(props: ExamComponentProps) {
  const { element, renderChildNodes } = props
  const { questionLabelIds } = useContext(QuestionContext)
  const displayNumber = element.getAttribute('display-number')!
  const hint = findChildElement(element, 'hint')
  const labelledBy = element.hasAttribute('max-length')
    ? questionLabelIds + ' ' + answerLengthInfoId(element)
    : questionLabelIds
  const textAnswer = <TextAnswerInput {...{ ...props, labelledBy }} />

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
