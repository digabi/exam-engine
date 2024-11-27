import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { query } from '../../dom-utils'
import { DNDAnswerOptionDraggable } from '../exam/DNDAnswerOptionDraggable'
import { DNDAnswerOption } from '../results/DNDAnswerOption'

export const DNDAnswerDroppable = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  correctIds,
  classes,
  questionId,
  page
}: {
  items: UniqueIdentifier[]
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  renderChildNodes: ExamComponentProps['renderChildNodes']
  correctIds?: UniqueIdentifier[]
  classes?: Record<string, boolean>
  questionId: UniqueIdentifier
  page: 'exam' | 'results'
}) => {
  const dndAnswerOptions = items?.map(id => answerOptionsByQuestionId?.[id] || null).filter(Boolean)
  const hasImages = dndAnswerOptions.some(option => query(option, 'image'))
  const hasAudio = dndAnswerOptions.some(option => query(option, 'audio'))
  const hasFormula = dndAnswerOptions.some(option => query(option, 'formula'))

  const { active, isOver } = useDroppable({ id: questionId })

  return (
    <div
      className={classNames('e-dnd-answer-droppable', {
        'has-images': hasImages,
        'has-audio': hasAudio,
        'has-formula': hasFormula,
        hovered: isOver,
        ...classes
      })}
    >
      {dndAnswerOptions?.map(element => {
        const optionId = Number(element.getAttribute('option-id')!)
        const hasImage = query(element, 'image')
        const isCorrect = correctIds?.includes(optionId)
        return (
          <div className={classNames({ 'has-image': hasImage })} key={element.getAttribute('option-id')}>
            {page === 'exam' ? (
              <DNDAnswerOptionDraggable element={element} renderChildNodes={renderChildNodes} key={optionId} />
            ) : (
              <div className="e-dnd-answer-option">
                <DNDAnswerOption
                  element={element}
                  renderChildNodes={renderChildNodes}
                  key={optionId}
                  className={!correctIds ? undefined : isCorrect ? 'correct-answer' : 'wrong-answer'}
                />
              </div>
            )}
          </div>
        )
      })}

      {!dndAnswerOptions.length &&
        (active ? (
          <i className="droppable-drop-here">Pudota tänne</i>
        ) : (
          <i className="droppable-no-answer">(Ei vastausta)</i>
        ))}
    </div>
  )
}
