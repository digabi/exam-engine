import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { useExamTranslation } from '../../i18n'
import { sectionTitleId } from '../../ids'
import AnsweringInstructions from '../AnsweringInstructions'
import { CommonExamContext } from '../context/CommonExamContext'
import NotificationIcon from '../NotificationIcon'
import { SectionContext } from '../context/SectionContext'

function SectionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { sections } = useContext(CommonExamContext)
  const { displayNumber, minAnswers, maxAnswers, childQuestions } = useContext(SectionContext)
  const { t } = useExamTranslation()

  return (
    <>
      {element.hasChildNodes() && (
        <h2 className="exam-section-title" id={sectionTitleId(displayNumber)} data-toc-id={`section-${displayNumber}`}>
          {sections.length > 1 && t('section', { displayNumber })} {renderChildNodes(element)}
        </h2>
      )}
      {maxAnswers != null && (
        <span className="notification notification--inline">
          <NotificationIcon />
          <AnsweringInstructions {...{ maxAnswers, minAnswers, childQuestions, elementType: 'section' }} />
        </span>
      )}
    </>
  )
}

export default React.memo(SectionTitle)
