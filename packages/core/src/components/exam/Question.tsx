import classNames from 'classnames'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext } from '../context/SectionContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { CasState } from '../../store/cas/reducer'

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const casStatus = useSelector((state: { cas: CasState }) => state.cas.casStatus)
  const { casForbidden } = useContext(SectionContext)
  const { displayNumber, level } = useContext(QuestionContext)

  return !casForbidden || casStatus === 'forbidden' ? (
    <div
      className={classNames('exam-question', {
        'e-level-0': level === 0,
        'e-pad-b-8 e-clearfix': level === 0,
        'e-mrg-l-8': level > 0,
      })}
    >
      <div className="anchor" id={displayNumber} />
      {renderChildNodes(element)}
    </div>
  ) : null
}

export default React.memo(withQuestionContext(Question))
