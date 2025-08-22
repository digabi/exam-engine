import { faCompressAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute, query } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { CasState } from '../../store/cas/reducer'
import { ExamContext } from '../context/ExamContext'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import { SectionContext } from '../context/SectionContext'
import { TOCContext } from '../context/TOCContext'
import ModalDialog from '../shared/internal/ModalDialog'
import ErrorIndicator from './internal/ErrorIndicator'
import SaveIndicator from './internal/SaveIndicator'

export const ExpandQuestionContext = createContext<{
  expanded: boolean
  toggleWriterMode: (s: boolean) => void
}>({ expanded: false, toggleWriterMode: () => undefined })

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const casStatus = useSelector((state: { cas: CasState }) => state.cas.casStatus)
  const { casForbidden } = useContext(SectionContext)
  const { displayNumber, level } = useContext(QuestionContext)
  const { examServerApi } = useContext(ExamContext)
  const [expanded, setExpanded] = useState<boolean>(false)

  const { t } = useExamTranslation()

  const toggleWriterMode = (expand: boolean) => {
    setExpanded(expand)
    if (examServerApi.logActivity) {
      examServerApi.logActivity(
        expand
          ? `Writer mode opened for display number ${displayNumber}`
          : `Writer mode closed for display number ${displayNumber}`
      )
    }
  }

  const textAnswerElement = query(element, 'text-answer')
  const questionId = textAnswerElement ? getNumericAttribute(textAnswerElement, 'question-id') : null

  useEffect(() => {
    if (expanded) {
      const textInput = questionId
        ? document.querySelector<HTMLElement>(`[data-question-id="${questionId}"]`)
        : undefined
      textInput?.focus()
    }
  }, [expanded])

  const ref = React.createRef<HTMLDivElement>()

  const { addRef } = useContext(TOCContext)

  useEffect(() => {
    if (ref?.current && level === 0 && addRef) {
      addRef(ref.current)
    }
  }, [])

  return !casForbidden || casStatus === 'forbidden' ? (
    <ExpandQuestionContext.Provider value={{ expanded, toggleWriterMode }}>
      <div
        className={classNames('e-exam-question', {
          'e-level-0 e-pad-b-8 e-clearfix': level === 0,
          'e-mrg-l-8 e-mrg-y-4': level > 0
        })}
        data-annotation-anchor={displayNumber}
        data-toc-id={`question-${displayNumber}`}
        ref={ref}
      >
        <div className="anchor" id={`question-nr-${displayNumber}`} />

        {expanded ? (
          <ModalDialog className="full-screen" onClose={() => toggleWriterMode(false)}>
            <button className="expand close" onClick={() => toggleWriterMode(false)}>
              <FontAwesomeIcon icon={faCompressAlt} />
              {t('close-writing-mode')}
            </button>
            {renderChildNodes(element)}
            <div className="e-indicators-container">
              <ErrorIndicator />
              <SaveIndicator />
            </div>
          </ModalDialog>
        ) : (
          renderChildNodes(element)
        )}
      </div>
    </ExpandQuestionContext.Provider>
  ) : null
}

export default React.memo(withQuestionContext(Question))
