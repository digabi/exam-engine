import { UniqueIdentifier } from '@dnd-kit/core'
import React from 'react'
import { ExamComponentProps } from '../..'
import { DNDAnswerCommon } from '../shared/DNDAnswerCommon'
import { Score } from '../shared/Score'

export type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export type PartialItemsState = {
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswer = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  questionId,
  maxScore
}: {
  items: UniqueIdentifier[]
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  questionId: UniqueIdentifier
  renderChildNodes: ExamComponentProps['renderChildNodes']
  titleElement?: Element
  displayNumber?: string
  maxScore?: number
}) => (
  <>
    <DNDAnswerCommon
      renderChildNodes={renderChildNodes}
      items={items}
      answerOptionsByQuestionId={answerOptionsByQuestionId}
      classes={{ root: questionId === 'root' }}
      isInExam={true}
      questionId={questionId}
    />

    {maxScore ? <Score score={maxScore} size="small" /> : null}
  </>
)
