import classNames from 'classnames'
import React, { createContext, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext } from '../context/SectionContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { CasState } from '../../store/cas/reducer'
import { faCompressAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const ExpandQuestionContext = createContext<{
  expanded: boolean
  toggleWriterMode: (s: boolean) => void
}>({ expanded: false, toggleWriterMode: () => undefined })

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const casStatus = useSelector((state: { cas: CasState }) => state.cas.casStatus)
  const { casForbidden } = useContext(SectionContext)
  const { displayNumber, level } = useContext(QuestionContext)
  const [expanded, setExpanded] = useState<boolean>(false)

  const toggleWriterMode = (open: boolean) => {
    open
      ? document.querySelector('body')?.classList.remove('writer-mode')
      : document.querySelector('body')?.classList.add('writer-mode')
    setExpanded((expanded) => !expanded)
  }

  return !casForbidden || casStatus === 'forbidden' ? (
    <ExpandQuestionContext.Provider value={{ expanded, toggleWriterMode }}>
      <div
        className={classNames('exam-question', {
          'e-level-0': level === 0,
          'e-pad-b-4 e-pad-t-4 e-clearfix': level === 0,
          'e-mrg-l-8': level > 0,
          expanded
        })}
      >
        <div className="anchor" id={displayNumber} />

        {expanded ? (
          <div className="full-screen">
            <button className="expand close" onClick={() => toggleWriterMode(true)}>
              <FontAwesomeIcon icon={faCompressAlt} />
              Pienennä näkymä
            </button>
            {renderChildNodes(element)}
          </div>
        ) : (
          renderChildNodes(element)
        )}
      </div>
    </ExpandQuestionContext.Provider>
  ) : null
}

export default React.memo(withQuestionContext(Question))
