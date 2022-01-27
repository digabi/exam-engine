import classNames from 'classnames'
import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { getNumericAttribute, mapChildElements, query } from '../../dom-utils'
import { AppState } from '../../store'
import * as actions from '../../store/answers/actions'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { ChoiceAnswer as ChoiceAnswerT, QuestionId } from '../../types/ExamAnswer'
import { QuestionContext } from '../context/QuestionContext'

interface ChoiceAnswerOptionProps extends ExamComponentProps {
  questionId: QuestionId
  selected: boolean
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  direction: string
  value: string
}

function ChoiceAnswerOption({
  selected,
  element,
  renderChildNodes,
  questionId,
  onSelect,
  direction,
  value,
}: ChoiceAnswerOptionProps) {
  const className = element.getAttribute('class')

  const content = (
    <div
      className={classNames('e-choice-answer-option e-column', className, {
        'e-choice-answer-option--selected': selected,
      })}
    >
      {renderChildNodes(element)}
    </div>
  )

  return direction === 'vertical' ? (
    <div className="e-mrg-b-1">
      <label
        className={classNames('e-columns', {
          'e-columns--inline':
            query(element, ['image', 'video']) == null /* Force full width for options containing responsive media */,
        })}
      >
        <input
          type="radio"
          className="e-radio-button e-column e-column--narrow"
          name={String(questionId)}
          onChange={onSelect}
          value={value}
          checked={selected}
        />
        {content}
      </label>
    </div>
  ) : (
    <div className="e-column e-mrg-b-1">
      <label className="e-block e-text-center">
        <input
          type="radio"
          className="e-radio-button"
          name={String(questionId)}
          onChange={onSelect}
          value={value}
          checked={selected}
        />
        {content}
      </label>
    </div>
  )
}

interface ChoiceAnswerProps extends ExamComponentProps {
  answer?: ChoiceAnswerT
  saveAnswer: typeof actions.saveAnswer
}

function ChoiceAnswer({ answer, saveAnswer, element, renderChildNodes }: ChoiceAnswerProps) {
  const { questionLabelIds } = useContext(QuestionContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const direction = element.getAttribute('direction') || 'vertical'
  const className = element.getAttribute('class')
  const displayNumber = element.getAttribute('display-number')!
  const onSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    saveAnswer({ type: 'choice', questionId, value: event.currentTarget.value, displayNumber })
  }

  return (
    <>
      <div
        className={classNames('e-choice-answer e-mrg-b-4', className, {
          'e-columns': direction === 'horizontal',
        })}
        data-question-id={questionId}
        role="radiogroup"
        aria-labelledby={questionLabelIds}
      >
        {mapChildElements(element, (childElement) => {
          const optionId = childElement.getAttribute('option-id')!
          const isNoAnswer = childElement.getAttribute('type') === 'no-answer'
          const value = isNoAnswer ? '' : optionId
          const selected = answer != null && answer.value === value

          return (
            <ChoiceAnswerOption
              {...{
                element: childElement,
                onSelect,
                renderChildNodes,
                questionId,
                key: optionId,
                direction,
                selected,
                value,
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

export default connect(mapStateToProps, {
  saveAnswer: actions.saveAnswer,
})(ChoiceAnswer)
