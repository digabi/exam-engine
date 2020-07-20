import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import AnsweringInstructions from './AnsweringInstructions'
import { CommonExamContext } from './CommonExamContext'
import NotificationIcon from './NotificationIcon'
import { SectionContext } from './SectionContext'
import { ExamComponentProps } from '../createRenderChildNodes'
import { sectionTitleId } from './ids'

function ExamSectionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { numberOfSections } = useContext(CommonExamContext)
  const { displayNumber, minAnswers, maxAnswers, childQuestions } = useContext(SectionContext)
  const { t } = useTranslation()

  return (
    <>
      {element.hasChildNodes() && (
        <h2 className="exam-section-title" id={sectionTitleId(displayNumber)}>
          {numberOfSections > 1 && t('part', { displayNumber })} {renderChildNodes(element)}
        </h2>
      )}
      {maxAnswers != null && (
        <span className="notification notification--inline">
          <NotificationIcon />
          <AnsweringInstructions
            maxAnswers={maxAnswers}
            minAnswers={minAnswers}
            childQuestions={childQuestions}
            type="section"
          />
        </span>
      )}
    </>
  )
}

export default React.memo(ExamSectionTitle)
