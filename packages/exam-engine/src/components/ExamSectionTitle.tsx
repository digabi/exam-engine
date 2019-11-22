import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import AnsweringInstructions from './AnsweringInstructions'
import { ExamContext } from './ExamContext'
import NotificationIcon from './NotificationIcon'
import { SectionContext } from './SectionContext'
import { ExamComponentProps } from './types'

function ExamSectionTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { numberOfSections } = useContext(ExamContext)
  const { displayNumber, minAnswers, maxAnswers, childQuestions } = useContext(SectionContext)
  const { t } = useTranslation()

  return (
    <>
      {element.hasChildNodes() && (
        <h2 className="exam-section-title" id={displayNumber + '-title'}>
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
