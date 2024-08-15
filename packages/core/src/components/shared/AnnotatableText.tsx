import { partition } from 'lodash-es'
import React, { useContext, useEffect, useRef } from 'react'
import { getElementPath } from '../../dom-utils'
import { NewRenderableAnnotation, RenderableAnnotation } from '../../types/Score'
import { AnnotationContext } from '../context/AnnotationProvider'
import { IsInSidebarContext } from '../context/IsInSidebarContext'

const isExamAnnotation = (
  annotation: NewRenderableAnnotation | RenderableAnnotation
): annotation is RenderableAnnotation => 'annotationId' in annotation

export const AnnotatableText = ({ node }: { node: Node }) => {
  const annotationContextData = useContext(AnnotationContext)
  const { isInSidebar } = useContext(IsInSidebarContext)
  const { annotations, onClickAnnotation, setNewAnnotationRef, newAnnotation } = annotationContextData

  const canNotBeAnnotated =
    annotationContextData?.annotations === undefined ||
    node.textContent?.trim().length === 0 ||
    isInSidebar !== undefined

  if (canNotBeAnnotated) {
    return node.textContent!
  }

  const path = getElementPath(node as Element)

  const newAnnotationPartsForThisNode = newAnnotation?.annotationParts?.filter(p => p.annotationAnchor === path) || []
  const savedAnnotationsForThisNode = annotations?.[path] || []
  const allAnnotationsForThisNode = [...savedAnnotationsForThisNode, ...newAnnotationPartsForThisNode]

  const textWithoutLineBreaksAndExtraSpaces = node.textContent!.replace(/\n/g, ' ').replace(/\s+/g, ' ')

  return (
    <span className="e-annotatable" key={path} data-annotation-path={path} data-testid={path}>
      {allAnnotationsForThisNode.length > 0 && onClickAnnotation
        ? markText(
            textWithoutLineBreaksAndExtraSpaces,
            allAnnotationsForThisNode,
            onClickAnnotation,
            setNewAnnotationRef
          )
        : textWithoutLineBreaksAndExtraSpaces}
    </span>
  )
}

export function markText(
  text: string,
  annotations: (RenderableAnnotation | NewRenderableAnnotation)[],
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: RenderableAnnotation) => void,
  setNewAnnotationRef: (ref: HTMLElement | undefined) => void
) {
  if (annotations.length === 0) {
    return [text]
  }

  function getMarkedText(annotation: RenderableAnnotation | NewRenderableAnnotation) {
    return text.substring(annotation.startIndex, annotation.startIndex + annotation.length)
  }

  const nodes: React.ReactNode[] = []
  annotations.sort((a, b) => a.startIndex - b.startIndex)

  const [validAnnotations, invalidAnnotations] = partition(
    annotations,
    annotation =>
      annotation.startIndex >= 0 && annotation.length > 0 && annotation.selectedText === getMarkedText(annotation)
  )

  if (invalidAnnotations?.length > 0) {
    console.error(
      'Invalid annotations:',
      invalidAnnotations,
      invalidAnnotations.map(
        a =>
          `selectedText (${a.selectedText}) does not match text picked by startIndex and length (${getMarkedText(a)})`
      )
    )
  }

  let lastIndex = 0

  const [hiddenAnnotations, visibleAnnotations] = partition(validAnnotations, a => a.hidden)

  const getKey = (annotation: RenderableAnnotation | NewRenderableAnnotation) =>
    isExamAnnotation(annotation) ? annotation.annotationId + annotation.startIndex : annotation.startIndex

  hiddenAnnotations.forEach(annotation => {
    const key = getKey(annotation)
    nodes.push(
      <mark
        key={key}
        className="e-annotation"
        data-annotation-id={isExamAnnotation(annotation) ? annotation.annotationId : ''}
        data-hidden="true"
      />
    )
  })

  for (const annotation of visibleAnnotations) {
    const markedText = getMarkedText(annotation)

    // Add unmarked text before this mark
    if (annotation.startIndex > lastIndex) {
      nodes.push(text.substring(lastIndex, annotation.startIndex))
    }

    // Add marked text
    const key = getKey(annotation)
    nodes.push(
      annotation.hidden ? (
        <mark
          key={key}
          className="e-annotation"
          data-annotation-id={isExamAnnotation(annotation) ? annotation.annotationId : ''}
          data-hidden="true"
        />
      ) : (
        <Mark
          key={key}
          annotation={annotation}
          markedText={markedText}
          onClickAnnotation={onClickAnnotation}
          setNewAnnotationRef={setNewAnnotationRef}
        />
      )
    )

    // if annotation is hidden and it starts inside another annotation, we must not increment lastIndex (actually it would be decremented)
    const hiddenAnnotationInsideCurrentAnnotation = annotation.startIndex < lastIndex && annotation.hidden

    if (!hiddenAnnotationInsideCurrentAnnotation) {
      lastIndex = annotation.startIndex + (annotation.hidden ? 0 : annotation.length)
    }
  }

  // Add remaining unmarked text
  nodes.push(text.substring(lastIndex))
  return nodes
}

const Mark = ({
  annotation,
  markedText,
  onClickAnnotation,
  setNewAnnotationRef
}: {
  annotation: RenderableAnnotation | NewRenderableAnnotation
  markedText: string
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: RenderableAnnotation) => void
  setNewAnnotationRef: (ref: HTMLElement | undefined) => void
}) => {
  const markRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (markRef.current && !isExamAnnotation(annotation)) {
      setNewAnnotationRef(markRef.current)
    }
  }, [])

  return (
    <mark
      ref={markRef}
      className="e-annotation"
      data-annotation-id={isExamAnnotation(annotation) ? annotation.annotationId : ''}
      data-hidden="false"
      data-annotation-path={annotation.annotationAnchor}
      onClick={e => (isExamAnnotation(annotation) ? onClickAnnotation(e, annotation) : undefined)}
    >
      {markedText}
      {annotation?.markNumber && <sup className="e-annotation" data-content={annotation?.markNumber} />}
    </mark>
  )
}
