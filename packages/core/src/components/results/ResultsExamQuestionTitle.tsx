import classNames from 'classnames'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ResultsState } from '../../store/index'
import AnsweringInstructions from '../AnsweringInstructions'
import NotificationIcon from '../NotificationIcon'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps } from '../types'
import { calculateSumScore, ResultsContext } from './ResultsContext'

function ResultsExamQuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, maxScore, level, maxAnswers, childQuestions } = useContext(QuestionContext)
  const Tag = ('h' + Math.min(3 + level, 6)) as any
  const { t } = useTranslation()

  const answersById = useSelector((state: ResultsState) => state.answers.answersById)
  const { gradingStructure, scores } = useContext(ResultsContext)
  const sumScore = calculateSumScore(element.parentElement!, gradingStructure, scores, answersById, level === 0)

  return (
    <>
      <div className="e-result-scorecount e-float-right">
        {t('points', { count: maxScore })} max <br />
        <b>{t('points', { count: sumScore })}</b>
        {level === 0 && (
          <span className="js-displayedTopLevelQuestionPoints" style={{ display: 'none' }}>
            {sumScore}
          </span>
        )}
      </div>
      <Tag className={classNames('exam-question-title', { 'e-normal e-font-size-m': level > 0 })}>
        <strong
          className={classNames('exam-question-title__display-number', {
            'exam-question-title__display-number--indented': level > 0
          })}
        >
          {displayNumber}
          {'. '}
        </strong>
        {renderChildNodes(element)}
      </Tag>
      {maxAnswers != null && childQuestions.length > 0 && (
        <p className="e-italic">
          <NotificationIcon />
          <AnsweringInstructions maxAnswers={maxAnswers} childQuestions={childQuestions} type="question" />
        </p>
      )}
    </>
  )
}

export default React.memo(ResultsExamQuestionTitle)
