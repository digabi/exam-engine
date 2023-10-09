import React, { useContext } from 'react'
import SectionElement from '../SectionElement'
import { SectionContext, withSectionContext } from '../context/SectionContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { sectionTitleId } from '../../ids'

function Section({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(SectionContext)

  return (
    <SectionElement aria-labelledby={sectionTitleId(displayNumber)}>
      <div className="e-results-section-wrapper">{renderChildNodes(element)}</div>
    </SectionElement>
  )
}
export default React.memo(withSectionContext(Section))
