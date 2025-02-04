import classNames from 'classnames'
import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { createRenderChildNodes, ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { tocTitleId } from '../../ids'
import { AnswersState } from '../../store/answers/reducer'
import { CommonExamContext } from '../context/CommonExamContext'
import { withQuestionContext } from '../context/QuestionContext'
import { withSectionContext } from '../context/SectionContext'
import { TOCQuestion } from './TOCQuestion'
import { TOCSection } from './TOCSection'
import { IsInSidebarContext } from '../context/IsInSidebarContext'

const renderChildNodes = createRenderChildNodes({
  section: withSectionContext(TOCSection),
  question: withQuestionContext(TOCQuestion)
})()

export const mkTableOfContents = (options: {
  showAttachmentLinks: boolean
  showAnsweringInstructions: boolean
  isInSidebar: boolean
}) => {
  const { showAnsweringInstructions, isInSidebar } = options

  const TableOfContents: React.FunctionComponent<ExamComponentProps> = () => {
    const { root, maxScore } = useContext(CommonExamContext)
    const { t } = useExamTranslation()
    const maxAnswers = getNumericAttribute(root, 'max-answers')

    const showExamValidationErrors =
      isInSidebar &&
      !!useSelector((state: { answers: AnswersState }) =>
        state.answers.validationErrors?.find(i => i?.elementType === 'exam')
      )

    const ref = React.createRef<HTMLDivElement>()

    useEffect(() => {
      // Prevent scrolling the whole page when scrolling the TOC
      const handleTOCScroll = (e: WheelEvent) => {
        const toc = e.currentTarget as Element
        if (toc.scrollHeight <= toc.clientHeight) {
          return
        }
        const deltaY = e.deltaY
        const hitsTop = deltaY < 0 && toc.scrollTop === 0
        const hitsBottom = deltaY > 0 && toc.scrollTop >= toc.scrollHeight - toc.clientHeight
        if (hitsTop || hitsBottom) {
          e.preventDefault()
        }
      }

      ref?.current?.addEventListener('wheel', handleTOCScroll, { passive: false })
      return () => ref?.current?.removeEventListener('wheel', handleTOCScroll)
    }, [])

    return (
      <nav className="table-of-contents" aria-labelledby={tocTitleId} ref={ref}>
        {!isInSidebar && (
          <h2 id={tocTitleId}>
            <span className="e-toc-heading">{t('toc-heading')}</span>
          </h2>
        )}

        {showAnsweringInstructions && maxAnswers && (
          <div style={{ display: 'grid' }}>
            <div className={classNames('answer-instructions', { error: showExamValidationErrors })}>
              {showExamValidationErrors && <div className="error-mark exam">!</div>}
              <span className="error-reason">{t('max-answers-warning', { count: maxAnswers })}</span>
            </div>
          </div>
        )}
        <IsInSidebarContext.Provider value={{ isInSidebar }}>
          <ol className="e-list-plain e-pad-l-0">{renderChildNodes(root)}</ol>
        </IsInSidebarContext.Provider>
        <div className="e-columns">
          <strong className="e-column e-total">{t('exam-total')}</strong>
          <strong className="e-column e-column--narrow table-of-contents--score-column">
            {t('points', { count: maxScore })}
          </strong>
          {isInSidebar && <span className="e-column e-column--narrow e-external-material" />}
        </div>
      </nav>
    )
  }

  return React.memo(TableOfContents)
}
