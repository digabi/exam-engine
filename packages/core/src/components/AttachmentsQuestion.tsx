import React, { useContext } from 'react'
import { ExamComponentProps, RenderOptions } from '../createRenderChildNodes'
import { findChildElement, parentElements } from '../dom-utils'
import { QuestionContext, withQuestionContext } from './QuestionContext'
import Section from './Section'

function AttachmentsQuestion({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, hasExternalMaterial, level } = useContext(QuestionContext)

  return isTopmostQuestionContainingExternalMaterial(element, hasExternalMaterial, level) ? (
    <Section id={displayNumber} aria-labelledby={displayNumber + '-title'}>
      {renderChildNodes(element, RenderOptions.SkipHTML)}
    </Section>
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

export default React.memo(withQuestionContext(AttachmentsQuestion))
