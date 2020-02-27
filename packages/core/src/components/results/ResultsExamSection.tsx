import React, { useContext } from 'react'

import Section from '../Section'
import { SectionContext, withSectionContext } from '../SectionContext'
import { ExamComponentProps } from '../types'

function ExamSection({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(SectionContext)

  return (
    <Section aria-labelledby={displayNumber + '-title'}>
      <div className="e-results-section-wrapper">{renderChildNodes(element)}</div>
    </Section>
  )
}

export default React.memo(withSectionContext(ExamSection))
