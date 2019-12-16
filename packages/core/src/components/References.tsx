import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { createRenderChildNodes } from '../createRenderChildNodes'
import { queryAll, queryAncestors } from '../dom-utils'
import { ExamContext } from './ExamContext'
import Reference from './Reference'
import Section from './Section'
import { ExamComponentProps } from './types'

const renderChildNodes = createRenderChildNodes({})

function References(_: ExamComponentProps) {
  const { root } = useContext(ExamContext)
  const internalReferences = queryAll(root, 'reference').filter(
    reference => queryAncestors(reference, 'external-material') == null
  )

  return internalReferences.length > 0 ? (
    <Section aria-labelledby="references-title">
      <h2 id="references-title">
        <Translation>{t => t('references.heading')}</Translation>
      </h2>
      <ol className="e-list-data e-color-darkgrey e-light">
        {internalReferences.map((reference, i) => {
          const question = queryAncestors(reference, 'question')!
          const displayNumber = question.getAttribute('display-number')!
          return (
            <li data-list-number={displayNumber} key={displayNumber + i}>
              <Reference element={reference} renderChildNodes={renderChildNodes} />
            </li>
          )
        })}
      </ol>
    </Section>
  ) : null
}

export default React.memo(References)
