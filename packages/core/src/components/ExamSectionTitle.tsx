import React, { useContext } from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'
import { useExamTranslation } from '../i18n'
import { sectionTitleId } from '../ids'
import AnsweringInstructions from './AnsweringInstructions'
import { CommonExamContext } from './CommonExamContext'
import NotificationIcon from './NotificationIcon'
import { SectionContext } from './SectionContext'

function ExamSectionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { numberOfSections } = useContext(CommonExamContext)
  const { displayNumber, minAnswers, maxAnswers, childQuestions } = useContext(SectionContext)
  const { t } = useExamTranslation()

  return (
    <>
      {element.hasChildNodes() && (
        <h2 className="exam-section-title" id={sectionTitleId(displayNumber)}>
          {numberOfSections > 1 && t('section', { displayNumber })} {renderChildNodes(element)}
        </h2>
      )}
      {maxAnswers != null && (
        <span className="notification notification--inline">
          <NotificationIcon />
          <AnsweringInstructions {...{ maxAnswers, minAnswers, childQuestions, type: 'section' }} />
        </span>
      )}
    </>
  )
}

export default React.memo(ExamSectionTitle)
