import classNames from 'classnames'
import React, { useContext } from 'react'
import { createRenderChildNodes } from '../../createRenderChildNodes'
import { getNumericAttribute, mapChildElements, query } from '../../dom-utils'
import ExamAttachment from '../ExamAttachment'
import Image from '../Image'
import { ExamComponentProps, QuestionId } from '../types'
import { findMultiChoiceFromGradingStructure, ResultsContext } from './ResultsContext'

interface ChoiceAnswerOptionProps extends ExamComponentProps {
  questionId: QuestionId
  selected: boolean
  direction: string
  isCorrect: boolean
}

const renderChildNodes = createRenderChildNodes({
  attachment: ExamAttachment,
  image: Image
})

function ChoiceAnswerOption({ selected, element, questionId, direction, isCorrect }: ChoiceAnswerOptionProps) {
  const className = element.getAttribute('class')
  const optionId = element.getAttribute('option-id')!

  const content = (
    <div
      className={classNames('e-choice-answer-option e-column', className, {
        'e-choice-answer-option--selected': selected
      })}
    >
      {renderChildNodes(element)}
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

function ResultsChoiceAnswer({ element }: ExamComponentProps) {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId]

  const direction = element.getAttribute('direction') || 'vertical'
  const className = element.getAttribute('class')

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
