import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { CommonExamContext } from '../context/CommonExamContext'
import { SectionContext } from '../context/SectionContext'
import { useExamTranslation } from '../../i18n'
import { sectionTitleId } from '../../ids'

const SectionTitle: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { numberOfSections } = useContext(CommonExamContext)
  const { displayNumber } = useContext(SectionContext)
  const { t } = useExamTranslation()

  return (
    <>
      {element.hasChildNodes() && (
        <h2 className="e-grading-instructions-section-title" id={sectionTitleId(displayNumber)}>
          {numberOfSections > 1 && t('section', { displayNumber })} {renderChildNodes(element)}
        </h2>
      )}
    </>
  )
}

export default SectionTitle
