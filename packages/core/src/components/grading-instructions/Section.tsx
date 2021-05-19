import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import SectionElement from '../SectionElement'
import { sectionTitleId } from '../../ids'
import { SectionContext, withSectionContext } from '../context/SectionContext'

const Section: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { displayNumber } = useContext(SectionContext)

  return (
    <SectionElement className="e-grading-instruction-section" aria-labelledby={sectionTitleId(displayNumber)}>
      {renderChildNodes(element)}
    </SectionElement>
  )
}

export default withSectionContext(Section)
