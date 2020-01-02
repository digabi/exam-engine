import classNames from 'classnames'
import * as _ from 'lodash-es'
import React from 'react'
import { connect } from 'react-redux'
import { getNumericAttribute, mapChildElements, query } from '../dom-utils'
import { AppState } from '../store'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps, QuestionId } from './types'

interface ChoiceAnswerOptionProps extends ExamComponentProps {
  questionId: QuestionId
  selected: boolean
  direction: string
  maxScore: number
}

function ChoiceAnswerOption({
  selected,
  element,
  renderChildNodes,
  questionId,
  direction,
  maxScore
}: ChoiceAnswerOptionProps) {
  const className = element.getAttribute('class')
  const optionId = element.getAttribute('option-id')!
  const score = getNumericAttribute(element, 'score') || 0
  const isCorrect = score === maxScore

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

function ChoiceAnswerResult({ answer, element, renderChildNodes }: ChoiceAnswerResultsProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const direction = element.getAttribute('direction') || 'vertical'
  const className = element.getAttribute('class')

  const maxScore = _.max(mapChildElements(element, childElement => getNumericAttribute(childElement, 'score'))) || 0

  return (
    <>
      <div
        className={classNames('e-choice-answer', className, {
          'e-columns': direction === 'horizontal'
        })}
      >
        {mapChildElements(element, childElement => {
          const optionId = childElement.getAttribute('option-id')!
          const selected = answer != null && answer.value === optionId

          return (
            <ChoiceAnswerOption
              {...{
                element: childElement,
                renderChildNodes,
                questionId,
                key: optionId,
                direction,
                selected,
                maxScore
              }}
            />
          )
        })}
      </div>
    </>
  )
}

function mapStateToProps(state: AppState, { element }: ExamComponentProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as ChoiceAnswerT | undefined
  return { answer }
}

export default connect(mapStateToProps)(ChoiceAnswerResult)
