import classNames from 'classnames'
import * as _ from 'lodash-es'
import React from 'react'
import { connect } from 'react-redux'
import { findChildElement, getNumericAttribute, mapChildElements } from '../../dom-utils'
import { AppState } from '../../store'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps } from '../types'

interface DropdownAnswerProps extends ExamComponentProps {
  answer?: ChoiceAnswerT
}

function DropdownAnswerResult({ element, answer }: DropdownAnswerProps) {
  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, childElement => answer.value === childElement.getAttribute('option-id'))

  const maxScore = _.max(mapChildElements(element, childElement => getNumericAttribute(childElement, 'score'))) || 0

  const correctAnswers = _.compact(
    mapChildElements(element, childElement => {
      if (getNumericAttribute(childElement, 'score') === maxScore) {
        return childElement.textContent
      }
    })
  )

  if (currentlySelectedItem) {
    const isAnswerCorrect = correctAnswers.includes(currentlySelectedItem.textContent!)
    return (
      <>
        <span
          className={classNames('e-dropdown-answer__answered', {
            'e-dropdown-answer__answered--correct': isAnswerCorrect,
            'e-dropdown-answer__answered--wrong': !isAnswerCorrect
          })}
        >
          {currentlySelectedItem.textContent}
        </span>
        {!isAnswerCorrect && <span className="e-dropdown-answer__correct">{correctAnswers.join(',')}</span>}
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

export default connect(mapStateToProps)(DropdownAnswerResult)
