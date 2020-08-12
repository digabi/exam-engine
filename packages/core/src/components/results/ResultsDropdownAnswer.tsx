import classNames from 'classnames'
import React, { ReactNode, useContext } from 'react'
import { findChildElement, getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../QuestionContext'
import { findMultiChoiceFromGradingStructure, ResultsContext } from './ResultsContext'
import ResultsExamQuestionAutoScore from './ResultsExamQuestionAutoScore'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { ChoiceAnswer } from '../..'
import { useTranslation } from 'react-i18next'
import { ScreenReaderOnly } from '../ScreenReaderOnly'
import { intersperse } from '../../utils'
import * as _ from 'lodash-es'

function ResultsDropdownAnswer({ element, renderChildNodes }: ExamComponentProps) {
  const { t } = useTranslation()
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const { answers } = useContext(QuestionContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId] as ChoiceAnswer | undefined

  const selectedOption = findChildElement(
    element,
    (childElement) => answer?.value === childElement.getAttribute('option-id')
  )

  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)!

  if (selectedOption) {
    const correctIds = choice.options.filter((o) => o.correct).map((o) => o.id)

    const correctOptions = Array.from(element.children).filter((childElement) =>
      correctIds.includes(getNumericAttribute(childElement, 'option-id')!)
    )

    const isAnswerCorrect = correctIds.includes(getNumericAttribute(selectedOption, 'option-id') as number)
    const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
    const scoreValue = answer && choice.options.find((option) => option.id === Number(answer.value))!.score

    const maxScore = getNumericAttribute(element, 'max-score')!

    return (
      <>
        {answers.length > 1 && <sup>{displayNumber}</sup>}

        <span
          className={classNames('e-dropdown-answer__answered', {
            'e-dropdown-answer__answered--correct': isAnswerCorrect,
            'e-dropdown-answer__answered--wrong': !isAnswerCorrect,
          })}
        >
          <ScreenReaderOnly>{t('screen-reader.answer-begin')}</ScreenReaderOnly>
          {renderChildNodes(selectedOption)}
          <ScreenReaderOnly>{t('screen-reader.answer-end')}</ScreenReaderOnly>
          {isAnswerCorrect && <ScreenReaderOnly>{t('screen-reader.correct-answer')}</ScreenReaderOnly>}
        </span>
        {!isAnswerCorrect && (
          <span className="e-dropdown-answer__correct" aria-hidden={true}>
            {intersperse(', ', _.flatMap<Element, ReactNode>(correctOptions, _.unary(renderChildNodes)))}
          </span>
        )}
        {scoreValue != null && (
          <ResultsExamQuestionAutoScore score={scoreValue} maxScore={maxScore} displayNumber={displayNumber} />
        )}
      </>
    )
  }
  return null
}

export default React.memo(ResultsDropdownAnswer)
