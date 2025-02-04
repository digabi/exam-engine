import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { queryAll, queryAncestors } from '../../dom-utils'
import { formatQuestionDisplayNumber } from '../../formatting'
import { useExamTranslation } from '../../i18n'
import { referencesTitleId } from '../../ids'
import { CommonExamContext } from '../context/CommonExamContext'
import Reference from './Reference'
import SectionElement from '../SectionElement'

function References({ renderChildNodes }: ExamComponentProps) {
  const { root } = useContext(CommonExamContext)
  const { t } = useExamTranslation()
  const internalReferences = queryAll(root, 'reference').filter(
    reference => queryAncestors(reference, 'external-material') == null
  )

  return internalReferences.length > 0 ? (
    <SectionElement aria-labelledby={referencesTitleId}>
      <h2 id={referencesTitleId}>{t('references.heading')}</h2>
      <div className="anchor" id="references" />
      <ol className="e-list-data" data-annotation-anchor={referencesTitleId}>
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
    </SectionElement>
  ) : null
}

export default React.memo(References)
