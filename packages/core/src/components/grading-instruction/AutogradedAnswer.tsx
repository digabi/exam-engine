import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { QuestionContext } from '../context/QuestionContext'
import { findChildElement, getAttribute, getNumericAttribute } from '../../dom-utils'
import { Score } from '../shared/Score'
import AnswerGradingInstruction from './AnswerGradingInstruction'

const AutogradedAnswer: React.FC<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { answers } = useContext(QuestionContext)
  const gradingInstructions = findChildElement(element, 'answer-grading-instruction')

  const content = (
    <>
      {gradingInstructions && <AnswerGradingInstruction {...{ element: gradingInstructions, renderChildNodes }} />}
      <ul>{renderChildNodes(element)}</ul>
    </>
  )

  if (answers.length === 1) {
    return content
  } else {
    const displayNumber = getAttribute(element, 'display-number')
    const maxScore = getNumericAttribute(element, 'max-score')!

    const hint = findChildElement(element, 'hint')

    return (
      <div className="e-mrg-l-8">
        <p className="exam-question-title">
          <span className="exam-question-title__display-number--indented e-semibold">{displayNumber} </span>
          {hint && renderChildNodes(hint)} <Score score={maxScore} />
        </p>
        {content}
      </div>
    )
  }
}

export default AutogradedAnswer
