import classNames from 'classnames'
import React, { useContext } from 'react'
import AnsweringInstructions from './AnsweringInstructions'
import NotificationIcon from './NotificationIcon'
import { QuestionContext } from './QuestionContext'
import { Score } from './Score'
import { ExamComponentProps } from './types'

function ExamQuestionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, maxScore, level, maxAnswers, childQuestions } = useContext(QuestionContext)
  const Tag = ('h' + Math.min(3 + level, 6)) as any

  return (
    <>
      <Tag className={classNames('exam-question-title', { 'e-normal e-font-size-m': level > 0 })}>
        <strong
          className={classNames('exam-question-title__display-number', {
            'exam-question-title__display-number--indented': level > 0,
          })}
        >
          {displayNumber}
          {'. '}
        </strong>
        {renderChildNodes(element)} <Score score={maxScore} size={level === 0 ? 'large' : 'small'} />
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

export default React.memo(ExamQuestionTitle)
