import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { findChildElement, getNumericAttribute, mapChildElements } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../QuestionContext'
import { ChoiceAnswer, ExamComponentProps } from '../types'
import { findMultiChoiceFromGradingStructure, ResultsContext } from './ResultsContext'
import ResultsExamQuestionAutoScore from './ResultsExamQuestionAutoScore'

function ResultsDropdownAnswer({ element }: ExamComponentProps) {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const { answers } = useContext(QuestionContext)
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
    const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
    const scoreValue = answer && choice.options.find(option => option.id === Number(answer.value))!.score

    const maxScore = getNumericAttribute(element, 'max-score')!

    return (
      <>
        {answers.length > 1 && <sup>{displayNumber}</sup>}

        <span
          className={classNames('e-dropdown-answer__answered', {
            'e-dropdown-answer__answered--correct': isAnswerCorrect,
            'e-dropdown-answer__answered--wrong': !isAnswerCorrect
          })}
        >
          {currentlySelectedItem.textContent}
        </span>
        {!isAnswerCorrect && <span className="e-dropdown-answer__correct">{correctAnswers.join(',')}</span>}
        {scoreValue != null && (
          <ResultsExamQuestionAutoScore score={scoreValue} maxScore={maxScore} displayNumber={displayNumber} />
        )}
      </>
    )
  }
  return null
}

export default React.memo(ResultsDropdownAnswer)
