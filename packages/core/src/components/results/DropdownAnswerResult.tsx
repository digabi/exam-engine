import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { findChildElement, getNumericAttribute, mapChildElements } from '../../dom-utils'
import { AppState } from '../../store'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps } from '../types'
import { ExamResultsContext, findMultiChoiceFromGradingStructure } from './ExamResultsContext'

interface DropdownAnswerResultProps extends ExamComponentProps {
  answer?: ChoiceAnswerT
}

function DropdownAnswerResult({ element, answer }: DropdownAnswerResultProps) {
  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, childElement => answer.value === childElement.getAttribute('option-id'))

  const { gradingStructure } = useContext(ExamResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')

  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId!)

  if (currentlySelectedItem) {
    const correctIds = choice.options.filter((o: { correct: boolean }) => o.correct).map((o: { id: any }) => o.id)

    const correctAnswers = _.compact(
      mapChildElements(element, childElement => {
        if (correctIds.includes(getNumericAttribute(childElement, 'option-id'))) {
          return childElement.textContent
        }
      })
    )
    const isAnswerCorrect = correctIds.includes(getNumericAttribute(currentlySelectedItem, 'option-id'))
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
