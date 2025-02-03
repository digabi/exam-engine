import * as _ from 'lodash-es'
import React from 'react'
import { AnnotationPart, WithAnnotationId } from '../../types/ExamAnnotations'
import AnnotationTextMark from './AnnotationTextMark'
import HiddenAnnotationMark from './HiddenAnnotationMark'

export function getKey(annotation: AnnotationPart) {
  return isExistingAnnotation(annotation)
    ? annotation.annotationId + annotation.annotationAnchor
    : annotation.annotationAnchor
}

export function isExistingAnnotation(annotation: AnnotationPart): annotation is WithAnnotationId<AnnotationPart> {
  return 'annotationId' in annotation
}

function getMarkedText(text: string, startIndex: number, length: number) {
  return text.substring(startIndex, startIndex + length)
}

export function markText(
  text: string,
  annotations: AnnotationPart[],
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotationId: number) => void,
  setNewAnnotationRef: (ref: HTMLElement | null) => void
) {
  if (annotations.length === 0) {
    return [text]
  }

  annotations.sort((a, b) => a.startIndex - b.startIndex)

  const [hiddenAnnotations, visibleAnnotations] = _.partition(annotations, a => a.hidden)

  const nodes: React.ReactNode[] = []

  hiddenAnnotations.forEach(annotation => {
    const key = getKey(annotation)
    const annotationId = isExistingAnnotation(annotation) ? annotation.annotationId : null
    nodes.push(<HiddenAnnotationMark key={key} annotationId={annotationId} />)
  })

  let lastIndex = 0

  const onlyLeadingSpacesRemoved = text.replace(/^\s+/, ' ')
  const indentationSize = text.length - onlyLeadingSpacesRemoved.length

  const notOverlappingAnnotations = visibleAnnotations.reduce((acc, annotation) => {
    const overlapsWithAnyVisibleAnnotation = acc.some(
      a =>
        annotation.startIndex < a.startIndex + a.length &&
        a.startIndex < annotation.startIndex + annotation.length &&
        !a.hidden
    )
    acc.push({
      ...annotation,
      hidden: annotation.hidden || overlapsWithAnyVisibleAnnotation
    })
    return acc
  }, [] as AnnotationPart[])

  for (const annotation of notOverlappingAnnotations) {
    /* "August 2024 annotation" refers to annotations made on or after 7.8.2024, and on or before x.8.2024.
     * They use trimmed exam content (textWithoutLineBreaksAndExtraSpaces) for calculating startIndex.
     * Support for "August 2024 annotations" can be removed at least when S25 exams are held.
     *
     * TODO:
     * When support for Aug 2024 annotations can be removed, just do:
     * const correctStartIndex = annotation.startIndex
     * and remove any unused code left behind
     */

    const textWithoutLineBreaksAndExtraSpaces = text.replace(/\n/g, ' ').replace(/\s+/g, ' ')
    const annotatedTextAugust2024 = getMarkedText(
      textWithoutLineBreaksAndExtraSpaces,
      annotation.startIndex,
      annotation.length
    )
    const isAugust2024Annotation = annotatedTextAugust2024 === annotation.selectedText

    /**
     * index difference is defined by how much indentation the text paragraph has in xml,
     * and by how many line breaks there are before the annotated text.
     * */

    const amountOfLineBreaksBeforeAnnotation = text.split(annotation.selectedText)[0].match(/\n/g)?.length || 0
    const startIndexDifference = amountOfLineBreaksBeforeAnnotation * indentationSize

    const correctStartIndex = annotation.startIndex + (isAugust2024Annotation ? startIndexDifference : 0)
    const annotatedTextWithCorrectedStartIndex = getMarkedText(text, correctStartIndex, annotation.length)

    // Add unmarked text before this mark
    if (correctStartIndex > lastIndex) {
      nodes.push(text.substring(lastIndex, correctStartIndex))
    }

    // Add marked text
    const key = getKey(annotation)
    const annotationId = isExistingAnnotation(annotation) ? annotation.annotationId : null
    nodes.push(
      annotation.hidden ? (
        <HiddenAnnotationMark key={key} annotationId={annotationId} />
      ) : (
        <AnnotationTextMark
          key={key}
          annotation={annotation}
          onClickAnnotation={onClickAnnotation}
          setNewAnnotationRef={setNewAnnotationRef}
        >
          {annotatedTextWithCorrectedStartIndex}
        </AnnotationTextMark>
      )
    )

    lastIndex = correctStartIndex + annotation.length
  }

  // Add remaining unmarked text
  nodes.push(text.substring(lastIndex))
  return nodes
}
