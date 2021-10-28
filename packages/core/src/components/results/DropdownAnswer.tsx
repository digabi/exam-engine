import classNames from 'classnames'
import React, { useContext } from 'react'
import { ChoiceAnswer } from '../..'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, getNumericAttribute } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../context/QuestionContext'
import { ScreenReaderOnly } from '../ScreenReaderOnly'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import ResultsExamQuestionAutoScore from './internal/QuestionAutoScore'

function DropdownAnswer({ element, renderChildNodes }: ExamComponentProps) {
  const { t } = useExamTranslation()
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
            {correctOptions.map((correctOption, i) => (
              <React.Fragment key={i}>
                {renderChildNodes(correctOption)}
                {i < correctOptions.length - 1 && ', '}
              </React.Fragment>
            ))}
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

export default React.memo(DropdownAnswer)
