import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, query } from '../../dom-utils'
import { DNDAnswer as DNDAnswerExam, ItemsState } from '../exam/DNDAnswer'
import { DNDAnswer as DNDAnswerResults } from '../results/DNDAnswer'

export const DNDTitleAndAnswerCommon = ({
  element,
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  isInExam,
  hasAnswer
}: {
  element: Element
  renderChildNodes: ExamComponentProps['renderChildNodes']
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  isInExam?: boolean
  hasAnswer?: boolean
}) => {
  const questionId = element.getAttribute('question-id')!
  const displayNumber = element.getAttribute('display-number')!
  const maxScore = getNumericAttribute(element, 'max-score')
  const hasImages = !!query(element, 'image')
  const titleElement = query(element, 'dnd-answer-title')
  const hasTitle = titleElement && renderChildNodes(titleElement).length > 0

  return (
    <div
      className={classNames('e-dnd-answer', {
        root: questionId === 'root',
        'no-answer': !hasAnswer
      })}
      data-question-id={questionId}
      key={questionId}
    >
      <div className="anchor" id={`question-nr-${displayNumber}`} />

      {titleElement &&
        (!hasTitle ? (
          <i style={{ color: 'grey' }}>Tästä puuttuu kysymys...</i>
        ) : (
          <span className={classNames('e-dnd-answer-title', { 'has-images': hasImages })}>
            {renderChildNodes(titleElement)}
          </span>
        ))}

      <div className="connection-line" />

      {isInExam ? (
        <DNDAnswerExam
          renderChildNodes={renderChildNodes}
          items={items[questionId as UniqueIdentifier]}
          answerOptionsByQuestionId={answerOptionsByQuestionId}
          questionId={questionId}
          displayNumber={displayNumber}
          maxScore={maxScore}
        />
      ) : (
        <DNDAnswerResults
          renderChildNodes={renderChildNodes}
          items={items[questionId]}
          answerOptionsByQuestionId={answerOptionsByQuestionId}
          questionId={questionId}
          displayNumber={displayNumber}
          maxScore={maxScore}
        />
      )}
    </div>
  )
}
