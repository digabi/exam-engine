import React, { useContext } from 'react'
import { ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { findChildElement, parentElements } from '../../dom-utils'
import { QuestionContext, withQuestionContext } from '../context/QuestionContext'
import SectionElement from '../SectionElement'
import { questionTitleId } from '../../ids'

function Question({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial, level } = useContext(QuestionContext)

  return isTopmostQuestionContainingExternalMaterial(element, hasExternalMaterial, level) ? (
    <SectionElement id={displayNumber} aria-labelledby={questionTitleId(displayNumber)}>
      {renderChildNodes(element, RenderOptions.SkipHTML)}
    </SectionElement>
  ) : (
    <>{renderChildNodes(element, RenderOptions.SkipHTML)}</>
  )
}

function isTopmostQuestionContainingExternalMaterial(element: Element, hasExternalMaterial: boolean, level: number) {
  return (
    hasExternalMaterial &&
    (level === 0 ||
      parentElements(element).every((parent) =>
        parent.localName === 'question' ? !findChildElement(parent, 'external-material') : true
      ))
  )
}

export default React.memo(withQuestionContext(Question))
