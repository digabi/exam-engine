import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { ItemsState } from '../exam/DNDAnswer'
import { DNDAnswerOption as DNDAnswerOptionExam } from '../exam/DNDAnswerOption'
import { query } from '../../dom-utils'
import { DNDAnswerOptionCommon } from './DNDAnswerOptionCommon'

export const DNDAnswerCommon = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  questionId,
  displayNumber,
  classes,
  isInExam
}: {
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  questionId: UniqueIdentifier
  renderChildNodes: ExamComponentProps['renderChildNodes']
  displayNumber?: string
  classes?: Record<string, boolean>
  isInExam?: boolean
}) => {
  const idsInGroup = items[questionId] || []
  const dndAnswerOptions = idsInGroup.map(id => answerOptionsByQuestionId[id])
  const hasImages = dndAnswerOptions.some(option => query(option, 'image'))
  const hasAudio = dndAnswerOptions.some(option => query(option, 'audio'))
  const hasFormula = dndAnswerOptions.some(option => query(option, 'formula'))

  return (
    <>
      <div className="anchor" id={`question-nr-${displayNumber}`} />
      <div
        className={classNames('e-dnd-answer-droppable', {
          'has-images': hasImages,
          'has-audio': hasAudio,
          'has-formula': hasFormula,
          ...classes
        })}
      >
        {dndAnswerOptions?.map(element => {
          const optionId = element.getAttribute('option-id')!
          return isInExam ? (
            <DNDAnswerOptionExam element={element} renderChildNodes={renderChildNodes} key={optionId} />
          ) : (
            <div className="e-dnd-answer-option">
              <DNDAnswerOptionCommon element={element} renderChildNodes={renderChildNodes} key={optionId} />
            </div>
          )
        })}
      </div>
    </>
  )
}
