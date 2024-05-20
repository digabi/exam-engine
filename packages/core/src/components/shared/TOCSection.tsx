import React, { useContext } from 'react'
import { ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { AnswersState } from '../../store/answers/reducer'
import { SectionContext } from '../context/SectionContext'
import { findChildElement } from '../../dom-utils'
import { TOCSectionTitle } from './TOCSectionTitle'
import { tocSectionTitleId } from '../../ids'

export const TOCSection: React.FunctionComponent<ExamComponentProps & { answers: AnswersState }> = ({
  element,
  answers,
  renderChildNodes
}) => {
  const { displayNumber } = useContext(SectionContext)
  const sectionTitle = findChildElement(element, 'section-title')

  return (
    <li data-section-id={displayNumber}>
      {sectionTitle && (
        <TOCSectionTitle
          {...{
            element: sectionTitle,
            renderChildNodes,
            answers
          }}
        />
      )}
      <ol className="e-list-data e-pad-l-0" aria-labelledby={sectionTitle && tocSectionTitleId(displayNumber)}>
        {renderChildNodes(element, RenderOptions.SkipHTML)}
      </ol>
    </li>
  )
}
