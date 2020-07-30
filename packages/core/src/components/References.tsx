import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { createRenderChildNodes, ExamComponentProps } from '../createRenderChildNodes'
import { queryAll, queryAncestors } from '../dom-utils'
import { CommonExamContext } from './CommonExamContext'
import Reference from './Reference'
import Section from './Section'
import { referencesTitleId } from '../ids'
import { formatQuestionDisplayNumber } from '../formatting'

const renderChildNodes = createRenderChildNodes({})
function References(_props: ExamComponentProps) {
  const { root } = useContext(CommonExamContext)
  const internalReferences = queryAll(root, 'reference').filter(
    (reference) => queryAncestors(reference, 'external-material') == null
  )

  return internalReferences.length > 0 ? (
    <Section aria-labelledby={referencesTitleId}>
      <h2 id={referencesTitleId}>
        <Translation>{(t) => t('references.heading')}</Translation>
      </h2>
      <ol className="e-list-data e-color-darkgrey e-light">
        {internalReferences.map((reference, i) => {
          const question = queryAncestors(reference, 'question')!
          const displayNumber = question.getAttribute('display-number')!
          return (
            <li data-list-number={formatQuestionDisplayNumber(displayNumber)} key={`${displayNumber}${i}`}>
              <Reference element={reference} renderChildNodes={renderChildNodes} />
            </li>
          )
        })}
      </ol>
    </Section>
  ) : null
}

export default React.memo(References)
