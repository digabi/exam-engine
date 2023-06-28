import classNames from 'classnames'
import React, { Dispatch, SetStateAction, createContext, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext } from '../context/SectionContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { CasState } from '../../store/cas/reducer'

export const ExpandQuestionContext = createContext<{
  expanded: boolean
  setExpanded: Dispatch<SetStateAction<boolean>>
}>({ expanded: false, setExpanded: () => undefined })

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const casStatus = useSelector((state: { cas: CasState }) => state.cas.casStatus)
  const { casForbidden } = useContext(SectionContext)
  const { displayNumber, level } = useContext(QuestionContext)
  const [expanded, setExpanded] = useState<boolean>(false)

  return !casForbidden || casStatus === 'forbidden' ? (
    <ExpandQuestionContext.Provider value={{ expanded, setExpanded }}>
      <div
        className={classNames('exam-question', {
          'e-level-0': level === 0,
          'e-pad-b-4 e-pad-t-4 e-clearfix': level === 0,
          'e-mrg-l-8': level > 0,
          expanded
        })}
      >
        <div className="anchor" id={displayNumber} />
        {expanded && (
          <div className="expand close" onClick={() => setExpanded(false)}>
            Sulje kirjoitusnäkymä
          </div>
        )}
        {renderChildNodes(element)}
      </div>
    </ExpandQuestionContext.Provider>
  ) : null
}

export default React.memo(withQuestionContext(Question))
