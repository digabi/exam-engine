import { useDraggable } from '@dnd-kit/core'
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute } from '../../dom-utils'
import { DNDAnswerOption } from '../results/DNDAnswerOption'

export const DNDAnswerOptionDraggable = ({ element, renderChildNodes }: ExamComponentProps) => {
  const optionId = getNumericAttribute(element, 'option-id')!

  const { attributes, listeners, setNodeRef, isDragging, setActivatorNodeRef } = useDraggable({
    id: optionId
  })

  const style = { opacity: isDragging ? 0.3 : 1 }

  return (
    <div ref={setNodeRef} className="e-dnd-answer-option" data-testid="dnd-answer-option">
      <DNDAnswerOption element={element} renderChildNodes={renderChildNodes} style={style} />

      <div {...listeners} {...attributes} ref={setActivatorNodeRef} className="drag-handle">
        <FontAwesomeIcon size="1x" icon={faUpDownLeftRight} />
      </div>
    </div>
  )
}
