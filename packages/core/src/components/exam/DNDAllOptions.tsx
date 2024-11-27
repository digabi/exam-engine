import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import React from 'react'
import { RenderChildNodes } from '../../createRenderChildNodes'
import { DNDAnswerDroppable } from '../shared/DNDAnswerDroppable'

export const AllDNDOptions = ({
  items,
  renderChildNodes,
  answerOptionsByOptionId
}: {
  items: UniqueIdentifier[]
  renderChildNodes: RenderChildNodes
  answerOptionsByOptionId: Record<UniqueIdentifier, Element>
}) => {
  const { setNodeRef } = useDroppable({ id: 'root' })

  return (
    <SortableContext items={items}>
      <span className="droppable-title">Vastausvaihtoehdot:</span>
      <span ref={setNodeRef}>
        <DNDAnswerDroppable
          renderChildNodes={renderChildNodes}
          questionId="root"
          items={items}
          answerOptionsByQuestionId={answerOptionsByOptionId}
          page="exam"
          classes={{ root: true }}
        />
      </span>
    </SortableContext>
  )
}
