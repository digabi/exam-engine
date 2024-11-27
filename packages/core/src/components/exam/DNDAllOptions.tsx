import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import React from 'react'
import { RenderChildNodes } from '../../createRenderChildNodes'
import { DNDDroppable } from '../shared/DNDDroppable'

export const AllDNDOptions = ({
  items,
  renderChildNodes,
  answerOptionElements
}: {
  items: UniqueIdentifier[]
  renderChildNodes: RenderChildNodes
  answerOptionElements: Element[]
}) => {
  const { setNodeRef } = useDroppable({ id: 'root' })

  return (
    <SortableContext items={items}>
      <span className="droppable-title">Vastausvaihtoehdot:</span>
      <span ref={setNodeRef}>
        <DNDDroppable
          renderChildNodes={renderChildNodes}
          questionId="root"
          page="exam"
          classes={['root']}
          answerOptionElements={answerOptionElements}
        />
      </span>
    </SortableContext>
  )
}
