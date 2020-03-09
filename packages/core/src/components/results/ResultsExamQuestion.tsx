import classNames from 'classnames'
import React, { useContext } from 'react'
import { findChildrenAnswers, getNumericAttribute } from '../../dom-utils'
import { QuestionContext, withQuestionContext } from '../QuestionContext'
import { ExamAnswer, ExamComponentProps } from '../types'
import AnnotationList from './AnnotationList'
import { ResultsContext } from './ResultsContext'

function ResultsExamQuestion({ element, renderChildNodes }: ExamComponentProps) {
  const { answersByQuestionId } = useContext(ResultsContext)
  const { displayNumber, level } = useContext(QuestionContext)
  const hasAnswers = questionHasAnswers(element, answersByQuestionId)

  return hasAnswers ? (
    <div
      className={classNames('exam-question', {
        'e-mrg-b-8 e-clearfix': level === 0,
        'e-mrg-l-8 e-mrg-y-4': level > 0
      })}
      id={displayNumber}
    >
      {renderChildNodes(element)}
      <AnnotationList />
    </div>
  ) : null
}

function questionHasAnswers(element: Element, answers: Record<number, ExamAnswer>): boolean {
  const answerElems = findChildrenAnswers(element)
  return answerElems.some(e => answers[getNumericAttribute(e, 'question-id')!])
}

export default React.memo(withQuestionContext(ResultsExamQuestion))
