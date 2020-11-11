import classNames from 'classnames'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute, mapChildElements, query } from '../../dom-utils'
import { findMultiChoiceFromGradingStructure, ResultsContext } from './ResultsContext'
import ResultsExamQuestionAutoScore from './ResultsExamQuestionAutoScore'
import { QuestionId } from '../..'
import { useTranslation } from 'react-i18next'
import { ScreenReaderOnly } from '../ScreenReaderOnly'

interface ChoiceAnswerOptionProps extends ExamComponentProps {
  questionId: QuestionId
  selected: boolean
  direction: string
  isCorrect: boolean
}

function ChoiceAnswerOption({
  renderChildNodes,
  selected,
  element,
  questionId,
  direction,
  isCorrect,
}: ChoiceAnswerOptionProps) {
  const { t } = useTranslation()
  const className = element.getAttribute('class')
  const optionId = element.getAttribute('option-id')!

  const content = (
    <div
      className={classNames('e-choice-answer-option e-column', className, {
        'e-choice-answer-option--selected': selected,
      })}
    >
      {renderChildNodes(element)}
    </div>
  )
  const Content: React.FunctionComponent<{ narrow?: boolean }> = ({ narrow = false }) => (
    <>
      <input
        type="radio"
        className={classNames('e-radio-button', { 'e-column e-column--narrow': narrow })}
        name={String(questionId)}
        value={optionId}
        checked={selected}
        readOnly
      />
      {content}
      {isCorrect && <ScreenReaderOnly>{t('screen-reader.correct-answer')}</ScreenReaderOnly>}
    </>
  )

  return direction === 'vertical' ? (
    <div className="e-mrg-b-1">
      <label
        className={classNames('e-columns', {
          'e-correct-answer-left': isCorrect,
          'e-columns--inline':
            query(element, ['image', 'video']) == null /* Force full width for options containing responsive media */,
        })}
      >
        <Content narrow />
      </label>
    </div>
  ) : (
    <div className="e-column e-mrg-b-1">
      <label className={classNames('e-block e-text-center', { 'e-correct-answer-bottom': isCorrect })}>
        <Content />
      </label>
    </div>
  )
}

function ResultsChoiceAnswer({ element, renderChildNodes }: ExamComponentProps) {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId]

  const direction = element.getAttribute('direction') || 'vertical'
  const className = element.getAttribute('class')

  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)!
  const scoreValue = answer && choice.options.find((option) => option.id === Number(answer.value))!.score
  const maxScore = getNumericAttribute(element, 'max-score')

  return (
    <>
      {scoreValue !== undefined && <ResultsExamQuestionAutoScore score={scoreValue} maxScore={maxScore} />}
      <div
        className={classNames('e-choice-answer', className, {
          'e-columns': direction === 'horizontal',
        })}
      >
        {mapChildElements(element, (childElement) => {
          const optionId = getNumericAttribute(childElement, 'option-id')!
          const selected = answer != null && Number(answer.value) === optionId
          const grading = choice.options.find((option) => option.id === optionId)!
          return (
            <ChoiceAnswerOption
              {...{
                element: childElement,
                renderChildNodes,
                questionId,
                key: optionId,
                direction,
                selected,
                isCorrect: grading.correct,
              }}
            />
          )
        })}
      </div>
    </>
  )
}

export default React.memo(ResultsChoiceAnswer)
