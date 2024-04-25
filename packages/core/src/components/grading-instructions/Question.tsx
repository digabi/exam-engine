import { ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import React, { useContext } from 'react'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import classNames from 'classnames'

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, level } = useContext(QuestionContext)

  return (
    <div
      className={classNames('e-grading-instructions-question', {
        'e-mrg-b-8 e-clearfix': level === 0,
        'e-mrg-l-8 e-mrg-y-4': level > 0
      })}
      id={displayNumber}
      data-annotation-anchor={displayNumber}
    >
      <div className="anchor" id={`question-nr-${displayNumber}`} />
      {renderChildNodes(element, RenderOptions.SkipHTML)}
    </div>
  )
}

export default withQuestionContext(Question)
