import React from 'react'
import { UniqueIdentifier, useDraggable } from '@dnd-kit/core'
import classNames from 'classnames'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, query } from '../../dom-utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'

export const DNDAnswerOption = ({
  element,
  renderChildNodes
}: ExamComponentProps & {
  value: UniqueIdentifier
}) => {
  const optionId = getNumericAttribute(element, 'option-id')!

  const { attributes, listeners, setNodeRef, isDragging, setActivatorNodeRef } = useDraggable({
    id: optionId
  })

  const style = { opacity: isDragging ? 0.3 : 1 }
  const hasImages = !!query(element, 'image')
  const hasFormula = !!query(element, 'formula')

  return (
    <div ref={setNodeRef}>
      <div
        className={classNames('e-dnd-answer-option', {
          'has-images': hasImages,
          'has-formula': hasFormula
        })}
        style={style}
      >
        <div className="option-content">
          {!renderChildNodes(element).length ? (
            <i style={{ color: 'grey' }}>Tähän tulee vastaus...</i>
          ) : (
            renderChildNodes(element)
          )}
        </div>
        <div {...listeners} {...attributes} ref={setActivatorNodeRef} className="drag-handle">
          <FontAwesomeIcon size="1x" icon={faUpDownLeftRight} />
        </div>
      </div>
    </div>
  )
}
