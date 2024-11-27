import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { ChoiceGroupQuestion, ExamComponentProps } from '../..'
import { getNumericAttribute, query } from '../../dom-utils'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import { ItemsState } from '../exam/DNDAnswerContainer'
import ResultsExamQuestionAutoScore from '../results/internal/QuestionAutoScore'
import { Score } from './Score'
import { DNDAnswerDroppable } from './DNDAnswerDroppable'

export const DNDTitleAndDroppable = ({
  element,
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  page
}: {
  element: Element
  renderChildNodes: ExamComponentProps['renderChildNodes']
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  page: 'exam' | 'results'
}) => {
  const questionId = element.getAttribute('question-id')!
  const questionIdNumber = Number(questionId)
  const displayNumber = element.getAttribute('display-number')!
  const maxScore = getNumericAttribute(element, 'max-score')
  const hasImages = !!query(element, 'image')
  const titleElement = query(element, 'dnd-answer-title')
  const hasTitle = titleElement && renderChildNodes(titleElement).length > 0

  const { gradingStructure, answersByQuestionId } = useContext(ResultsContext)
  const isStudentsExam = !gradingStructure
  const hasAnswer = answersByQuestionId && !!answersByQuestionId[questionIdNumber]?.value

  const { correctOptionIds, scoreValue } = getCorrectOptionIds(questionIdNumber, displayNumber)

  const { setNodeRef, isOver } = useDroppable({ id: questionId })

  return (
    <SortableContext id={String(questionId)} items={items[questionId] || []}>
      <span ref={setNodeRef}>
        <div
          className={classNames('e-dnd-answer', { 'no-answer': !hasAnswer })}
          data-question-id={questionId}
          key={questionId}
        >
          <div className="anchor" id={`question-nr-${displayNumber}`} />

          {titleElement &&
            (!hasTitle ? (
              <i style={{ color: 'grey' }}>Tästä puuttuu kysymys...</i>
            ) : (
              <span className={classNames('e-dnd-answer-title', { 'has-images': hasImages, hovered: isOver })}>
                {renderChildNodes(titleElement)}
              </span>
            ))}

          <div className="connection-line" />

          <DNDAnswerDroppable
            renderChildNodes={renderChildNodes}
            items={items[questionId] || []}
            answerOptionsByQuestionId={answerOptionsByQuestionId}
            questionId={questionId}
            correctIds={correctOptionIds}
            page={page}
          />

          {isStudentsExam ? (
            maxScore && <Score score={maxScore} size="small" />
          ) : (
            <ResultsExamQuestionAutoScore
              score={scoreValue}
              maxScore={maxScore}
              displayNumber={displayNumber}
              questionId={Number(questionId)}
            />
          )}
        </div>
      </span>
    </SortableContext>
  )
}

const getCorrectOptionIds = (questionId: number, displayNumber: string) => {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  if (!gradingStructure) {
    return { correctOptionIds: undefined, scoreValue: undefined }
  }
  const hasAnswer = !!answersByQuestionId && answersByQuestionId[questionId]?.value
  const answer = hasAnswer ? answersByQuestionId[questionId] : undefined
  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)!
  const scoreValue = !answer?.value
    ? undefined
    : (choice?.options.find(option => option.id === Number(answer.value) && option.correct)?.score ?? 0)
  const thisQuestion = gradingStructure?.questions.find(q => q.displayNumber === displayNumber) as ChoiceGroupQuestion
  const options = thisQuestion?.choices.find(c => c.id === questionId)?.options || []
  const correctOptionIds = options?.filter(o => o.correct).map(o => o.id)
  return { correctOptionIds, scoreValue }
}
