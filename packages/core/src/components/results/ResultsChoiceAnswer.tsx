import classNames from 'classnames'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { getNumericAttribute, mapChildElements, query } from '../../dom-utils'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps, QuestionId } from '../types'
import { ResultsContext, findMultiChoiceFromGradingStructure } from './ResultsContext'
import { ResultsState } from '../../store/index'

interface ChoiceAnswerOptionProps extends ExamComponentProps {
  questionId: QuestionId
  selected: boolean
  direction: string
  score: number
  isCorrect: boolean
}

function ChoiceAnswerOption({
  selected,
  element,
  renderChildNodes,
  questionId,
  direction,
  score,
  isCorrect
}: ChoiceAnswerOptionProps) {
  const className = element.getAttribute('class')
  const optionId = element.getAttribute('option-id')!

  const content = (
    <div
      className={classNames('e-choice-answer-option e-column', className, {
        'e-choice-answer-option--selected': selected
      })}
    >
      ({score}) {renderChildNodes(element)}
    </div>
  )

  return direction === 'vertical' ? (
    <div className="e-mrg-b-1">
      <label
        className={classNames('e-columns', {
          'e-correct-answer': isCorrect,
          'e-columns--inline':
            query(element, ['image', 'video']) == null /* Force full width for options containing responsive media */
        })}
      >
        <input
          type="radio"
          className="e-radio-button e-column e-column--narrow"
          name={String(questionId)}
          value={optionId}
          checked={selected}
          disabled
        />
        {content}
      </label>
    </div>
  ) : (
    <div className="e-column e-mrg-b-1">
      <label className={classNames('e-block e-text-center', { 'e-correct-answer': isCorrect })}>
        <input type="radio" className="e-radio-button" name={String(questionId)} value={optionId} checked={selected} />
        {content}
      </label>
    </div>
  )
}

interface ChoiceAnswerResultsProps extends ExamComponentProps {
  answer?: ChoiceAnswerT
}

function ResultsChoiceAnswer({ element, renderChildNodes }: ChoiceAnswerResultsProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = useSelector((state: ResultsState) => state.answers.answersById[questionId])

  const direction = element.getAttribute('direction') || 'vertical'
  const className = element.getAttribute('class')

  const { gradingStructure } = useContext(ResultsContext)
  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)!

  return (
    <>
      <div
        className={classNames('e-choice-answer', className, {
          'e-columns': direction === 'horizontal'
        })}
      >
        {mapChildElements(element, childElement => {
          const optionId = getNumericAttribute(childElement, 'option-id')!
          const selected = answer != null && Number(answer.value) === optionId
          const grading = choice.options.find(option => option.id === optionId)!
          return (
            <ChoiceAnswerOption
              {...{
                element: childElement,
                renderChildNodes,
                questionId,
                key: optionId,
                direction,
                selected,
                score: grading.score,
                isCorrect: grading.correct
              }}
            />
          )
        })}
      </div>
    </>
  )
}

export default React.memo(ResultsChoiceAnswer)
