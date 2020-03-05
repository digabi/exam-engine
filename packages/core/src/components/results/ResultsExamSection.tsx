import React, { useContext } from 'react'
import { query } from '../../dom-utils'
import Section from '../Section'
import { SectionContext, withSectionContext } from '../SectionContext'
import { ExamComponentProps } from '../types'
import { ResultsContext } from './ResultsContext'

function ResultsExamSection({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(SectionContext)
  const { answersByQuestionId } = useContext(ResultsContext)
  const containsAnswers = query(element, e => {
    const maybeQuestionId = e.getAttribute('question-id')
    return maybeQuestionId != null && answersByQuestionId.hasOwnProperty(maybeQuestionId)
  })

  return containsAnswers ? (
    <Section aria-labelledby={displayNumber + '-title'}>
      <div className="e-results-section-wrapper">{renderChildNodes(element)}</div>
    </Section>
  ) : null
}

export default React.memo(withSectionContext(ResultsExamSection))
