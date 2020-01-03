import * as _ from 'lodash-es'
import React from 'react'
import { connect } from 'react-redux'
import { findChildElement, getNumericAttribute, mapChildElements } from '../dom-utils'
import { AppState } from '../store'
import * as actions from '../store/answers/actions'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps } from './types'

interface DropdownAnswerProps extends ExamComponentProps {
  saveAnswer: typeof actions.saveAnswer
  answer?: ChoiceAnswerT
}

function DropdownAnswerResult({ element, answer }: DropdownAnswerProps) {
  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, childElement => answer.value === childElement.getAttribute('option-id'))

  const maxScore = _.max(mapChildElements(element, childElement => getNumericAttribute(childElement, 'score'))) || 0

  const correctAnswer = findChildElement(
    element,
    childElement => getNumericAttribute(childElement, 'score') === maxScore
  )

  if (currentlySelectedItem && correctAnswer) {
    const isAnswerCorrect = currentlySelectedItem.textContent === correctAnswer.textContent
    return (
      <>
        <span className="e-dropdown-answer__answered">{currentlySelectedItem.textContent}</span>
        {!isAnswerCorrect && <span className="e-dropdown-answer__corrected">{correctAnswer.textContent}</span>}
      </>
    )
  }
  return null
}

function mapStateToProps(state: AppState, { element }: ExamComponentProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as ChoiceAnswerT | undefined
  return { answer }
}

export default connect(mapStateToProps, {
  saveAnswer: actions.saveAnswer
})(DropdownAnswerResult)
