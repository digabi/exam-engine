import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, query } from '../../dom-utils'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import { DNDAnswerOption } from './DNDAnswerOption'
import ResultsExamQuestionAutoScore from './internal/QuestionAutoScore'

type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDTitleAndAnswer = ({
  element,
  renderChildNodes,
  items,
  answerOptionsByQuestionId
}: {
  element: Element
  renderChildNodes: ExamComponentProps['renderChildNodes']
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
}) => {
  const titleElement = query(element, 'dnd-answer-title')
  const maxScore = getNumericAttribute(element, 'max-score')
  const questionId = element.getAttribute('question-id')!
  const questionIdNumber = Number(questionId)
  const displayNumber = element.getAttribute('display-number')!

  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const answer = answersByQuestionId[questionIdNumber]
  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionIdNumber)!
  const scoreValue = (answer && choice?.options.find(option => option.id === Number(answer.value))?.score) || 0

  return (
    <div
      className={classNames('e-dnd-answer', {
        root: questionId === 'root'
      })}
      data-question-id={questionId}
      key={questionId}
    >
      {titleElement && <DNDAnswerTitle element={titleElement} renderChildNodes={renderChildNodes} />}
      <div className="connection-line" />

      <DNDAnswer
        titleElement={titleElement}
        renderChildNodes={renderChildNodes}
        items={items}
        answerOptionsByQuestionId={answerOptionsByQuestionId}
        id={questionId}
        displayNumber={displayNumber}
      />

      {scoreValue != null && (
        <ResultsExamQuestionAutoScore
          score={scoreValue}
          maxScore={maxScore}
          displayNumber={displayNumber}
          questionId={questionIdNumber}
        />
      )}
    </div>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => {
  const hasImages = !!query(element, 'image')
  return (
    <span
      className={classNames('e-dnd-answer-title', {
        'has-images': hasImages
      })}
    >
      {renderChildNodes(element)}
    </span>
  )
}

export const DNDAnswer = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  id,
  displayNumber
}: {
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  id: UniqueIdentifier
  renderChildNodes: ExamComponentProps['renderChildNodes']
  titleElement?: Element
  displayNumber?: string
}) => {
  const idsInGroup = items[id] || []
  const dndAnswerOptions = idsInGroup.map(id => answerOptionsByQuestionId[id])
  const hasImages = dndAnswerOptions.some(option => query(option, 'image'))
  const hasAudio = dndAnswerOptions.some(option => query(option, 'audio'))
  const hasFormula = dndAnswerOptions.some(option => query(option, 'formula'))

  return (
    <>
      <div className="anchor" id={`question-nr-${displayNumber}`} />
      <div
        className={classNames('e-dnd-answer-droppable', {
          'has-images': hasImages,
          'has-audio': hasAudio,
          'has-formula': hasFormula
        })}
      >
        {dndAnswerOptions?.map(element => {
          const optionId = element.getAttribute('option-id')!
          return (
            <DNDAnswerOption element={element} renderChildNodes={renderChildNodes} key={optionId} value={optionId} />
          )
        })}
      </div>
    </>
  )
}
