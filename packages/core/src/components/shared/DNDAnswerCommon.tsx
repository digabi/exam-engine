import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { query } from '../../dom-utils'
import { DNDAnswerOption as DNDAnswerOptionExam } from '../exam/DNDAnswerOption'
import { DNDAnswerOptionCommon } from './DNDAnswerOptionCommon'

export const DNDAnswerCommon = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  isInExam,
  correctIds,
  classes
}: {
  items: UniqueIdentifier[]
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  renderChildNodes: ExamComponentProps['renderChildNodes']
  isInExam?: boolean
  correctIds?: UniqueIdentifier[]
  classes?: Record<string, boolean>
}) => {
  const dndAnswerOptions = items?.map(id => answerOptionsByQuestionId[id]) || []
  const hasImages = dndAnswerOptions.some(option => query(option, 'image'))
  const hasAudio = dndAnswerOptions.some(option => query(option, 'audio'))
  const hasFormula = dndAnswerOptions.some(option => query(option, 'formula'))

  return (
    <div
      className={classNames('e-dnd-answer-droppable', {
        'has-images': hasImages,
        'has-audio': hasAudio,
        'has-formula': hasFormula,
        ...classes
      })}
    >
      {dndAnswerOptions?.map(element => {
        const optionId = Number(element.getAttribute('option-id')!)
        const hasImage = query(element, 'image')
        const isCorrect = correctIds?.includes(optionId)
        return (
          <div
            className={classNames('e-dnd-answer-option', { 'has-image': hasImage })}
            key={element.getAttribute('option-id')}
          >
            {isInExam ? (
              <DNDAnswerOptionExam element={element} renderChildNodes={renderChildNodes} key={optionId} />
            ) : (
              <DNDAnswerOptionCommon
                element={element}
                renderChildNodes={renderChildNodes}
                key={optionId}
                classes={[isCorrect ? 'correct-answer' : 'wrong-answer']}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
