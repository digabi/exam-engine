import classNames from 'classnames'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { calculateChildrenElemScores } from '../../dom-utils'
import { AppState } from '../../store/index'
import AnsweringInstructions from '../AnsweringInstructions'
import NotificationIcon from '../NotificationIcon'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps } from '../types'

interface ExamQuestionTitleProps extends ExamComponentProps {
  sumScore?: number
}

function ExamQuestionTitleResult({ element, renderChildNodes, sumScore }: ExamQuestionTitleProps) {
  const { displayNumber, maxScore, level, maxAnswers, childQuestions } = useContext(QuestionContext)
  const Tag = ('h' + Math.min(3 + level, 6)) as any
  const { t } = useTranslation()

  return (
    <>
      <div className="e-float-right">
        {t('points', { count: maxScore })} max <br />
        <b>{t('points', { count: sumScore })}</b>
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

function mapStateToProps(state: AppState, { element }: ExamComponentProps) {
  const questionElem = element.parentElement!
  const sumScore = calculateChildrenElemScores(questionElem, state.answers.answersById)
  return { sumScore }
}

export default connect(mapStateToProps)(ExamQuestionTitleResult)
