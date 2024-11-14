import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, query } from '../../dom-utils'
import { Score } from '../shared/Score'
import { DNDAnswerOption } from './DNDAnswerOption'

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
  const id = element.getAttribute('question-id')!
  const displayNumber = element.getAttribute('display-number')!

  return (
    <div
      className={classNames('e-dnd-answer', {
        root: id === 'root'
      })}
      data-question-id={id}
      key={id}
    >
      {titleElement && <DNDAnswerTitle element={titleElement} renderChildNodes={renderChildNodes} />}
      <div className="connection-line" />

      <DNDAnswer
        titleElement={titleElement}
        renderChildNodes={renderChildNodes}
        items={items}
        answerOptionsByQuestionId={answerOptionsByQuestionId}
        id={id}
        displayNumber={displayNumber}
      />

      {maxScore ? <Score score={maxScore} size="small" /> : null}
    </div>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => {
  const hasImages = !!query(element, 'image')

  if (!renderChildNodes(element).length) {
    return <i style={{ color: 'grey' }}>Tähän tulee kysymys...</i>
  } else
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
  const { setNodeRef, isOver, active } = useDroppable({ id })

  const hasImages = dndAnswerOptions.some(option => query(option, 'image'))
  const hasAudio = dndAnswerOptions.some(option => query(option, 'audio'))
  const hasFormula = dndAnswerOptions.some(option => query(option, 'formula'))

  return (
    <SortableContext id={String(id)} items={idsInGroup}>
      <div className="anchor" id={`question-nr-${displayNumber}`} />
      <div
        ref={setNodeRef}
        className={classNames('e-dnd-answer-droppable', {
          hovered: isOver,
          'ready-for-drop': !!active?.id,
          'has-images': hasImages,
          'has-audio': hasAudio,
          'has-formula': hasFormula,
          root: id === 'root'
        })}
      >
        {dndAnswerOptions?.map((element, index) => {
          const optionId = element.getAttribute('option-id')!
          return (
            <DNDAnswerOption
              element={element}
              renderChildNodes={renderChildNodes}
              key={optionId + index}
              value={optionId}
            />
          )
        })}
      </div>
    </SortableContext>
  )
}
