import classNames from 'classnames'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext } from '../context/SectionContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { CasState } from '../../store/cas/reducer'
import { faCompressAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useExamTranslation } from '../../i18n'

export const ExpandQuestionContext = createContext<{
  expanded: boolean
  toggleWriterMode: (s: boolean) => void
}>({ expanded: false, toggleWriterMode: () => undefined })

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const casStatus = useSelector((state: { cas: CasState }) => state.cas.casStatus)
  const { casForbidden } = useContext(SectionContext)
  const { displayNumber, level } = useContext(QuestionContext)
  const [expanded, setExpanded] = useState<boolean>(false)

  const { t } = useExamTranslation()

  const toggleWriterMode = (expand: boolean) => {
    setExpanded(expand)
    const body = document.querySelector('body')
    if (expand) {
      body?.classList.add('writer-mode')
    } else {
      body?.classList.remove('writer-mode')
      body?.classList.remove('rich-text-editor-focus')
      setTimeout(() => (window.location.href = `#question-nr-${displayNumber}`), 10)
    }
  }

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.code === 'Escape') {
      toggleWriterMode(false)
    }
  }

  useEffect(() => {
    if (expanded) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [expanded])

  return !casForbidden || casStatus === 'forbidden' ? (
    <ExpandQuestionContext.Provider value={{ expanded, toggleWriterMode }}>
      <div
        className={classNames('e-exam-question', {
          'e-level-0 e-pad-b-8 e-clearfix': level === 0,
          'e-mrg-l-8': level > 0,
          'e-expanded': expanded
        })}
      >
        <div className="anchor" id={`question-nr-${displayNumber}`} />

        {expanded ? (
          <div className="full-screen" data-full-screen-id={displayNumber}>
            <button className="expand close" onClick={() => toggleWriterMode(false)}>
              <FontAwesomeIcon icon={faCompressAlt} />
              {t('close-writing-mode')}
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
