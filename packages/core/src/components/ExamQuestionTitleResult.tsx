import classNames from 'classnames'
import _ from 'lodash-es'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { getNumericAttribute, queryAll } from '../dom-utils'
import * as actions from '../store/answers/actions'
import { AppState } from '../store/index'
import AnsweringInstructions from './AnsweringInstructions'
import NotificationIcon from './NotificationIcon'
import { QuestionContext } from './QuestionContext'
import { Score } from './Score'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps } from './types'
// import { queryAll } from '../dom-utils'

function ExamQuestionTitleResult({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, maxScore, level, maxAnswers, childQuestions } = useContext(QuestionContext)
  const Tag = ('h' + Math.min(3 + level, 6)) as any
  const { t } = useTranslation()
  const givenScore = element.getAttribute('scoreValue')

  // const answers = queryAll(element, 'text-answer', true)
  // console.log("answerssss", answers)

  return (
    <>
      <div className="resultsScore">
        {t('points', { count: maxScore })} max
        {givenScore && <Score score={Number(givenScore)} size="small" />}
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
  const childrenAnswers = queryAll(
    questionElem,
    ['choice-answer', 'dropdown-answer', 'text-answer', 'scored-text-answer'],
    true
  )

  const sum = _.sum(
    childrenAnswers.map(answer => {
      const questionId = getNumericAttribute(answer, 'question-id')!
      const scoredAnswer = state.answers.answersById[questionId] as any
      if (scoredAnswer) {
        return scoredAnswer.scoreValue ?? 0
      } else {
        return 0
      }
    })
  )
  console.log("summa", sum)

  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as ChoiceAnswerT | undefined
  // console.log("tilan answersit", state.answers)
  return { answer }
}

export default connect(mapStateToProps, {
  saveAnswer: actions.saveAnswer
})(ExamQuestionTitleResult)

// export default React.memo(ExamQuestionTitleResult)
