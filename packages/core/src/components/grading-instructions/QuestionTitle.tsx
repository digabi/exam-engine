import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { QuestionContext } from '../context/QuestionContext'
import classNames from 'classnames'
import { formatQuestionDisplayNumber } from '../../formatting'
import { Score } from '../shared/Score'

const QuestionTitle: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { displayNumber, maxScore, level } = useContext(QuestionContext)
  const Tag = `h${Math.min(3 + level, 6)}` as 'h3' | 'h4' | 'h5' | 'h6'

  return (
    <>
      <Tag className={classNames('exam-question-title', { 'e-normal e-font-size-m': level > 0 })}>
        <strong
          className={classNames('exam-question-title__display-number', {
            'exam-question-title__display-number--indented': level > 0
          })}
        >
          {`${formatQuestionDisplayNumber(displayNumber)} `}
        </strong>
        {renderChildNodes(element)} <Score score={maxScore} size={level === 0 ? 'large' : 'small'} />
      </Tag>
    </>
  )
}

export default QuestionTitle
