import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { ExamPage } from '../..'
import { RenderChildNodes, RenderComponentOverrides } from '../../createRenderChildNodes'
import { getNumericAttribute, query } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import ResultsExamQuestionAutoScore from '../results/internal/QuestionAutoScore'
import { DNDDroppable } from './DNDDroppable'
import { Score } from './Score'

export const DNDTitleAndDroppable = ({
  element,
  renderChildNodes,
  renderComponentOverrides,
  itemIds,
  page,
  answerOptionElements
}: {
  element: Element
  renderChildNodes: RenderChildNodes
  renderComponentOverrides: RenderComponentOverrides
  itemIds: UniqueIdentifier[]
  page: ExamPage
  answerOptionElements: Element[]
}) => {
  const { t } = useExamTranslation()
  const questionId = element.getAttribute('question-id')!
  const questionIdNumber = Number(questionId)
  const displayNumber = element.getAttribute('display-number')!

  const maxScore = getNumericAttribute(element, 'max-score')
  const hasImages = !!query(element, 'image')
  const titleElement = query(element, 'dnd-answer-title')
  const hasTitle = titleElement && renderChildNodes(titleElement).length > 0

  const { gradingStructure, answersByQuestionId } = useContext(ResultsContext)
  const isStudentsExam = !gradingStructure

  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionIdNumber)!
  const correctOptionIds = choice?.options?.filter(o => o.correct).map(o => o.id)

  const answer = answersByQuestionId?.[questionIdNumber] ?? undefined
  const scoreValue =
    (answer && choice?.options?.find(option => option.id === Number(answer?.value) && option.correct)?.score) || 0

  const lastLevelOfDisplayNumber = shortDisplayNumber(displayNumber)

  const { setNodeRef, isOver } = useDroppable({ id: questionId })

  return (
    <SortableContext id={questionId} items={itemIds}>
      <span ref={setNodeRef}>
        <div
          className={classNames('e-dnd-answer', {
            'no-answer': page === 'results' && !answer?.value
          })}
          data-question-id={questionId}
          key={questionId}
        >
          <div className="anchor" id={`question-nr-${displayNumber}`} />

          {titleElement &&
            (!hasTitle ? (
              <i style={{ color: 'grey' }}>{t('dnd-answers.question-missing')}</i>
            ) : (
              <span className={classNames('e-dnd-answer-title', { 'has-images': hasImages, hovered: isOver })}>
                {renderChildNodes(titleElement)}
              </span>
            ))}

          <div className="connection-line" />

          <DNDDroppable
            page={page}
            answerOptionElements={answerOptionElements}
            questionId={questionId}
            renderChildNodes={renderChildNodes}
            renderComponentOverrides={renderComponentOverrides}
            correctIds={correctOptionIds}
          />

          {isStudentsExam ? (
            maxScore && <Score score={maxScore} size="small" />
          ) : (
            <ResultsExamQuestionAutoScore
              score={answer?.value ? scoreValue : undefined}
              maxScore={maxScore}
              displayNumber={lastLevelOfDisplayNumber}
              questionId={questionIdNumber}
            />
          )}
        </div>
      </span>
    </SortableContext>
  )
}
