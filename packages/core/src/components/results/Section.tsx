import React, { useContext } from 'react'
import { query } from '../../dom-utils'
import SectionElement from '../SectionElement'
import { SectionContext, withSectionContext } from '../context/SectionContext'
import { ResultsContext } from '../context/ResultsContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { sectionTitleId } from '../../ids'

function Section({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(SectionContext)
  const { answersByQuestionId } = useContext(ResultsContext)
  const containsAnswers = query(element, e => {
    const maybeQuestionId = e.getAttribute('question-id')
    return maybeQuestionId != null && Object.prototype.hasOwnProperty.call(answersByQuestionId, maybeQuestionId)
  })

  return containsAnswers ? (
    <SectionElement aria-labelledby={sectionTitleId(displayNumber)}>
      <div className="e-results-section-wrapper">{renderChildNodes(element)}</div>
    </SectionElement>
  ) : null
}

export default React.memo(withSectionContext(Section))
