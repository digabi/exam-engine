import React, { useContext } from 'react'
import classnames from 'classnames'
import { QuestionContext } from '../../context/QuestionContext'
import { useIsStudentsExamineExamPage } from '../isExamineExamPageHook'
import { ResultsContext } from '../../context/ResultsContext'
import { useExamTranslation } from '../../../i18n'

function QuestionScoresContainer({
  answers,
  displayNumber,
  children,
  multilineAnswer,
  questionId
}: {
  answers: Element[]
  displayNumber?: string
  children: React.ReactNode
  multilineAnswer?: boolean
  questionId: number
}) {
  const { displayNumber: topLevelDisplayNumber } = useContext(QuestionContext)
  const isStudentsExamineExamPage = useIsStudentsExamineExamPage()
  const fullDisplayNumber = displayNumber ? `${topLevelDisplayNumber}.${displayNumber?.replace('.', '')}` : undefined

  const { answersByQuestionId } = useContext(ResultsContext)
  const isNonAnswer = questionId && answersByQuestionId ? answersByQuestionId[questionId]?.answerNonAnswer : false

  const { t } = useExamTranslation()

  if (isStudentsExamineExamPage) {
    return null
  }
  return (
    <span
      className={classnames('e-result-scorecount', 'e-float-right', {
        'e-result-scorecount-multiline-answer': multilineAnswer
      })}
      id={fullDisplayNumber}
    >
      {isNonAnswer && <div className="non-answer">{t('grading.non-answer-not-graded')}</div>}
      <span className="e-result-scorecount-border-wrap">
        {answers.length > 1 && displayNumber && (
          <sup className="e-result-scorecount-sup e-mrg-r-1" aria-hidden="true">
            {displayNumber}
          </sup>
        )}
        {children}
      </span>
    </span>
  )
}

export default React.memo(QuestionScoresContainer)
