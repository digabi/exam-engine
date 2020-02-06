import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { findChildElement, getNumericAttribute, mapChildElements } from '../../dom-utils'
import { ChoiceAnswer, ExamComponentProps } from '../types'
import { findMultiChoiceFromGradingStructure, ResultsContext } from './ResultsContext'

function ResultsDropdownAnswer({ element }: ExamComponentProps) {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId] as ChoiceAnswer | undefined

  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, childElement => answer.value === childElement.getAttribute('option-id'))

  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)!

  if (currentlySelectedItem) {
    const correctIds = choice.options.filter(o => o.correct).map(o => o.id)

    const correctAnswers = _.compact(
      mapChildElements(element, childElement => {
        if (correctIds.includes(getNumericAttribute(childElement, 'option-id') as number)) {
          return childElement.textContent
        }
      })
    )
    const isAnswerCorrect = correctIds.includes(getNumericAttribute(currentlySelectedItem, 'option-id') as number)
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

export default React.memo(ResultsDropdownAnswer)
