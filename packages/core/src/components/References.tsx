import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { createRenderChildNodes, ExamComponentProps } from '../createRenderChildNodes'
import { queryAll, queryAncestors } from '../dom-utils'
import { formatQuestionDisplayNumber } from '../formatting'
import { referencesTitleId } from '../ids'
import { CommonExamContext } from './CommonExamContext'
import Reference from './Reference'
import Section from './Section'

const renderChildNodes = createRenderChildNodes({})
function References(_props: ExamComponentProps) {
  const { root } = useContext(CommonExamContext)
  const { t } = useTranslation()
  const internalReferences = queryAll(root, 'reference').filter(
    (reference) => queryAncestors(reference, 'external-material') == null
  )

  return internalReferences.length > 0 ? (
    <Section aria-labelledby={referencesTitleId}>
      <h2 id={referencesTitleId}>{t('references.heading')}</h2>
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
