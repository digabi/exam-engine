import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { query } from '../../dom-utils'
import { DNDAnswerOptionDraggable } from '../exam/DNDAnswerOptionDraggable'
import { DNDAnswerOption } from '../results/DNDAnswerOption'

export const DNDDroppable = ({
  renderChildNodes,
  correctIds,
  classes = [],
  questionId,
  page,
  answerOptionElements = []
}: {
  renderChildNodes: ExamComponentProps['renderChildNodes']
  correctIds?: UniqueIdentifier[]
  classes?: string[]
  questionId: UniqueIdentifier
  page: 'exam' | 'results'
  answerOptionElements: Element[]
}) => {
  const hasImages = answerOptionElements.some(option => query(option, 'image'))
  const hasAudio = answerOptionElements.some(option => query(option, 'audio'))
  const hasFormula = answerOptionElements.some(option => query(option, 'formula'))

  const { active, isOver } = useDroppable({ id: questionId })

  return (
    <div
      className={classNames(['e-dnd-answer-droppable', ...classes], {
        'has-images': hasImages,
        'has-audio': hasAudio,
        'has-formula': hasFormula,
        hovered: isOver
      })}
    >
      {answerOptionElements?.map(element => {
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

      {!answerOptionElements.length &&
        (active ? (
          <i className="droppable-drop-here">Pudota tänne</i>
        ) : (
          <i className="droppable-no-answer">(Ei vastausta)</i>
        ))}
    </div>
  )
}
