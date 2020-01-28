import React, { useContext } from 'react'

import Section from '../Section'
import { SectionContext, withSectionContext } from '../SectionContext'
import { ExamComponentProps } from '../types'

function ExamSection({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(SectionContext)

  return (
    <Section className="exam-section" aria-labelledby={displayNumber + '-title'}>
      {renderChildNodes(element)}
    </Section>
  )
}

export default React.memo(withSectionContext(ExamSection))
