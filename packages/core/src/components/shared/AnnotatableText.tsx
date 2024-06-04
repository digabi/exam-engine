import { partition } from 'lodash-es'
import React, { useEffect, useRef } from 'react'
import { getElementPath, queryAncestors } from '../../dom-utils'
import { ExamAnnotation, NewExamAnnotation } from '../../types/Score'
import { AnnotationContextType } from '../context/AnnotationProvider'
import { onMouseDownForAnnotation } from '../grading/examAnnotationUtils'

const isExamAnnotation = (annotation: NewExamAnnotation | ExamAnnotation): annotation is ExamAnnotation =>
  'annotationId' in annotation

export const AnnotatableText = ({
  node,
  annotationContextData
}: {
  node: Node
  annotationContextData: AnnotationContextType
}) => {
  const { annotations, onClickAnnotation, setNewAnnotation, setNewAnnotationRef, newAnnotation } = annotationContextData

  const path = getElementPath(node as Element)
  const newAnnotationForThisNode = newAnnotation?.annotationAnchor === path ? newAnnotation : null
  const thisNodeAnnotations = [
    ...(annotations?.[path] || []),
    ...(newAnnotationForThisNode ? [newAnnotationForThisNode] : [])
  ]

  const mouseUpCallback = (annotation: NewExamAnnotation) => {
    const displayNumber = queryAncestors(node.parentElement!, 'question')?.getAttribute('display-number') || ''
    setNewAnnotation({ ...annotation, annotationAnchor: path, displayNumber })
  }

  function onMouseDown(e: React.MouseEvent) {
    const target = e.target as Element
    const clickIsInPopup = target.closest('.annotation-popup')
    if (!clickIsInPopup) {
      setNewAnnotation(null)
    }
    onMouseDownForAnnotation(e, mouseUpCallback)
  }

  return (
    <span onMouseDown={onMouseDown} className="e-annotatable" key={path}>
      {thisNodeAnnotations?.length > 0 ? markText(node.textContent!, thisNodeAnnotations) : node.textContent!}
    </span>
  )

  function markText(text: string, annotations: (NewExamAnnotation | ExamAnnotation)[]): React.ReactNode[] {
    if (annotations.length === 0) {
      return [text]
    }

    function getMarkedText(annotation: NewExamAnnotation) {
      return text.substring(annotation.startIndex, annotation.startIndex + annotation.length)
    }

    const nodes: React.ReactNode[] = []
    let lastIndex = 0
    annotations.sort((a, b) => a.startIndex - b.startIndex)

    const [validAnnotations, invalidAnnotations] = partition(
      annotations,
      annotation =>
        annotation.startIndex >= 0 && annotation.length > 0 && annotation.selectedText === getMarkedText(annotation)
    )

    if (invalidAnnotations.length > 0) {
      console.error(
        'Invalid annotations:',
        invalidAnnotations,
        invalidAnnotations.map(
          a =>
            `selectedText (${a.selectedText}) does not match text picked by startIndex and length (${getMarkedText(a)})`
        )
      )
    }

    for (const annotation of validAnnotations) {
      const markedText = getMarkedText(annotation)

      // Add unmarked text before this mark
      if (annotation.startIndex > lastIndex) {
        nodes.push(text.substring(lastIndex, annotation.startIndex))
      }

      // Add marked text
      const key = isExamAnnotation(annotation) ? annotation.annotationId : annotation.startIndex
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
            onClickAnnotation={onClickAnnotation!}
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
}

const Mark = ({
  annotation,
  markedText,
  onClickAnnotation,
  setNewAnnotationRef
}: {
  annotation: NewExamAnnotation | ExamAnnotation
  markedText: string
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: ExamAnnotation) => void
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
      onClick={e => (isExamAnnotation(annotation) ? onClickAnnotation(e, annotation) : undefined)}
    >
      {markedText}
      {annotation?.markNumber && <sup className="e-annotation" data-content={annotation?.markNumber} />}
    </mark>
  )
}
