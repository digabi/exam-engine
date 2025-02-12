import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamPage } from '../..'
import { RenderChildNodes, RenderComponentOverrides } from '../../createRenderChildNodes'
import { query } from '../../dom-utils'
import { DNDAnswerOptionDraggable } from '../exam/DNDAnswerOptionDraggable'
import { DNDAnswerOption } from '../results/DNDAnswerOption'
import { useExamTranslation } from '../../i18n'

export const DNDDroppable = ({
  renderChildNodes,
  renderComponentOverrides,
  correctIds,
  classes = [],
  questionId,
  page,
  answerOptionElements = []
}: {
  renderChildNodes: RenderChildNodes
  renderComponentOverrides: RenderComponentOverrides
  correctIds?: UniqueIdentifier[]
  classes?: string[]
  questionId: UniqueIdentifier
  page: ExamPage
  answerOptionElements: Element[]
}) => {
  const hasImages = answerOptionElements.some(option => query(option, 'image'))
  const hasAudio = answerOptionElements.some(option => query(option, 'audio'))

  const { active, isOver } = useDroppable({ id: questionId })
  const { t } = useExamTranslation()

  return (
    <div
      className={classNames(['e-dnd-answer-droppable', ...classes], {
        'has-images': hasImages,
        'has-audio': hasAudio,
        hovered: isOver
      })}
      data-testid="dnd-droppable"
    >
      {answerOptionElements?.map(element => {
        const optionId = Number(element.getAttribute('option-id')!)
        const isCorrect = correctIds?.includes(optionId)
        return (
          <React.Fragment key={element.getAttribute('option-id')}>
            {page === 'exam' ? (
              <DNDAnswerOptionDraggable
                element={element}
                renderChildNodes={renderChildNodes}
                renderComponentOverrides={renderComponentOverrides}
                key={optionId}
              />
            ) : (
              <div className="e-dnd-answer-option">
                <DNDAnswerOption
                  element={element}
                  renderChildNodes={renderChildNodes}
                  renderComponentOverrides={renderComponentOverrides}
                  key={optionId}
                  className={!correctIds ? undefined : isCorrect ? 'correct-answer' : 'wrong-answer'}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}

      {!answerOptionElements.length &&
        (active ? (
          <i className="droppable-drop-here">{t('dnd-answers.drop-here')}</i>
        ) : (
          <i className="droppable-no-answer">{t('dnd-answers.no-answer')}</i>
        ))}
    </div>
  )
}
