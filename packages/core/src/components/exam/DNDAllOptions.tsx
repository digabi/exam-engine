import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import React from 'react'
import { RenderChildNodes } from '../../createRenderChildNodes'
import { DNDDroppable } from '../shared/DNDDroppable'
import { useExamTranslation } from '../../i18n'

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
  const { t } = useExamTranslation()

  return (
    <SortableContext items={items}>
      <span className="droppable-title">{t('dnd-answers.all-answer-options')}</span>
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