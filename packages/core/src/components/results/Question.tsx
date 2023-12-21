import classNames from 'classnames'
import React, { useContext } from 'react'
import { findChildrenAnswers, getNumericAttribute } from '../../dom-utils'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import AnnotationList from './internal/AnnotationList'
import { ResultsContext } from '../context/ResultsContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { ExamAnswer } from '../..'
import { useExamTranslation } from '../../i18n'

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const { answersByQuestionId } = useContext(ResultsContext)
  const { displayNumber, level } = useContext(QuestionContext)
  const hasAnswers = questionHasAnswers(element, answersByQuestionId)
  const { i18n } = useExamTranslation()

  return (
    <div
      className={classNames('e-exam-question', `e-level-${level}`, {
        'e-mrg-b-8 e-clearfix': level === 0,
        'e-mrg-l-8 e-mrg-y-4': level > 0,
        'no-answer': !hasAnswers
      })}
      id={displayNumber}
      aria-description={!hasAnswers ? i18n.t('examineExam.questionHasNoAnswer') : undefined}
    >
      {renderChildNodes(element)}
      <AnnotationList />
    </div>
  )
}

function questionHasAnswers(element: Element, answers: Record<number, ExamAnswer>): boolean {
  const answerElems = findChildrenAnswers(element)
  return answerElems.some(e => answers[getNumericAttribute(e, 'question-id')!]?.value)
}

export default React.memo(withQuestionContext(Question))
