import React, { useContext } from 'react'
import { getElementPath } from '../../dom-utils'
import { AnnotationContext } from '../context/AnnotationProvider'
import { IsInSidebarContext } from '../context/IsInSidebarContext'
import { markText } from './markText'

export const AnnotatableText = ({ node }: { node: Node }) => {
  const annotationContextData = useContext(AnnotationContext)
  const { isInSidebar } = useContext(IsInSidebarContext)

  const canNotBeAnnotated =
    !annotationContextData.annotationsEnabled || node.textContent?.trim().length === 0 || isInSidebar !== undefined

  if (canNotBeAnnotated) {
    return node.textContent!
  }

  const { textAnnotations, onClickAnnotation, setNewAnnotationRef, newAnnotation } = annotationContextData

  const path = getElementPath(node as Element)

  const newAnnotationPartsForThisNode =
    newAnnotation?.annotationType === 'text'
      ? newAnnotation?.annotationParts?.filter(p => p.annotationAnchor === path) || []
      : []
  const savedAnnotationsForThisNode = textAnnotations?.[path] || []
  const allAnnotationsForThisNode = [...savedAnnotationsForThisNode, ...newAnnotationPartsForThisNode]

  return (
    <span className="e-annotatable" key={path} data-annotation-path={path} data-testid={path}>
      {allAnnotationsForThisNode.length > 0 && onClickAnnotation
        ? markText(node.textContent!, allAnnotationsForThisNode, onClickAnnotation, setNewAnnotationRef)
        : node.textContent}
    </span>
  )
}
