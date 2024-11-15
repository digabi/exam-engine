import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import React from 'react'
import { ExamComponentProps } from '../..'
import { DNDAnswerCommon } from '../shared/DNDAnswerCommon'
import { Score } from '../shared/Score'

export type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswer = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  questionId,
  displayNumber,
  maxScore
}: {
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  questionId: UniqueIdentifier
  renderChildNodes: ExamComponentProps['renderChildNodes']
  titleElement?: Element
  displayNumber?: string
  maxScore?: number
}) => {
  const idsInGroup = items[questionId] || []
  const { setNodeRef, isOver, active } = useDroppable({ id: questionId })

  return (
    <SortableContext id={String(questionId)} items={idsInGroup}>
      <div ref={setNodeRef}>
        <DNDAnswerCommon
          renderChildNodes={renderChildNodes}
          items={items}
          answerOptionsByQuestionId={answerOptionsByQuestionId}
          questionId={questionId}
          displayNumber={displayNumber}
          classes={{
            hovered: isOver,
            root: questionId === 'root',
            'ready-for-drop': !!active?.id
          }}
          isInExam={true}
        />
      </div>

      {maxScore ? <Score score={maxScore} size="small" /> : null}
    </SortableContext>
  )
}
