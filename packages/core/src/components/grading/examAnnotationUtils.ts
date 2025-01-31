import React from 'react'
import { AnnotationPart, NewExamAnnotation } from '../../types/ExamAnnotations'
import { textAnnotationFromRange } from './editAnnotations'

export function onMouseDownForAnnotation(e: React.MouseEvent, mouseUpCallback: (a: NewExamAnnotation) => void) {
  function onMouseUpAfterAnswerMouseDown() {
    window.removeEventListener('mouseup', onMouseUpAfterAnswerMouseDown)

    /**
     * selection.anchorNode = where mouse is pressed down (chronologically first)
     * selection.getRangeAt(0).startContainer = where selection starts (first in DOM)
     */

    const selection = window.getSelection()
    if (selection === null) return

    const startNode = selection.getRangeAt(0).startContainer.parentElement
    const endNode = selection.getRangeAt(selection.rangeCount - 1).endContainer.parentElement

    if (startNode && endNode && selection.toString().length > 0) {
      const hasMarks = selectionContainsNonhiddenMarks(selection)
      const startNodedisplayNumber = getDisplayNumber(startNode)
      const endNodeDisplayNumber = getDisplayNumber(endNode)

      if (
        startNodedisplayNumber === endNodeDisplayNumber &&
        isAnnotatable(startNode) &&
        isAnnotatable(endNode) &&
        !hasMarks
      ) {
        const annotations = extractAnnotationsFromSelection(selection)
        mouseUpCallback({
          annotationType: 'text',
          annotationParts: annotations,
          displayNumber: startNodedisplayNumber ?? '',
          selectedText: annotations.map(a => a.selectedText).join(' ')
        })
      }
    }
  }

  // Do annotations only with left mouse buttons
  if (e.button !== 0) {
    return
  }
  window.addEventListener('mouseup', onMouseUpAfterAnswerMouseDown)
}

const selectionContainsNonhiddenMarks = (selection: Selection) => {
  const rangeChildren = Array.from(selection?.getRangeAt(0).cloneContents().children)
  const childIsNonHiddenMark = rangeChildren?.some(
    child => child.tagName === 'MARK' && child.getAttribute('data-hidden') === 'false'
  )
  const childContainsNonHiddenMark = rangeChildren.some(child => child.querySelector('mark[data-hidden="false"]'))
  return childIsNonHiddenMark || childContainsNonHiddenMark
}

const getDisplayNumber = (node: HTMLElement) =>
  node?.closest('[data-annotation-anchor]')?.getAttribute('data-annotation-anchor')

const isAnnotatable = (node: HTMLElement) => node?.getAttribute('data-annotation-path') && node.tagName !== 'MARK'

const extractAnnotationsFromSelection = (selection: Selection) => {
  const ranges: Range[] = []
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i)
    ranges.push(range)
  }

  const annotations = ranges.reduce((annotations, range, rangeIndex) => {
    const firstNode = range.startContainer.parentElement
    const rangeElements = Array.from(range.cloneContents().children)

    if (!firstNode) return annotations

    const getAnnotationPart = (node: Element, isFirst: boolean, isLast: boolean) => {
      const annotationAnchor = node.getAttribute('data-annotation-path')
      if (!annotationAnchor) {
        return undefined
      }

      const selectedText = node.getAttribute('data-annotation-content') ?? node.textContent ?? ''
      if (isFirst) {
        const { startIndex, length } = textAnnotationFromRange(firstNode, range) ?? { startIndex: 0, length: 0 }
        return { annotationAnchor, selectedText, startIndex, length }
      }
      if (isLast) {
        return { annotationAnchor, selectedText, startIndex: 0, length: range.endOffset }
      }
      return { annotationAnchor, selectedText, startIndex: 0, length: selectedText.length }
    }

    if (rangeElements.length === 0) {
      const annotationAnchor = firstNode.getAttribute('data-annotation-path')
      if (!annotationAnchor) return annotations

      const annotationPart = getAnnotationPart(firstNode, true, true)
      if (annotationPart) {
        annotations.push(annotationPart)
      }
    }

    rangeElements.forEach((element, elementIndex) => {
      const isFirstRangeElement = rangeIndex === 0 && elementIndex === 0
      const isLastRangeElement = rangeIndex === ranges.length - 1 && elementIndex === rangeElements.length - 1

      const annotationPart = getAnnotationPart(element, isFirstRangeElement, isLastRangeElement)
      if (annotationPart) {
        annotations.push(annotationPart)
      } else {
        // child is a node with children, like <b> <span> text </span> </b>
        const allChildrenWithAnnotationPath = element.querySelectorAll('[data-annotation-path]')

        allChildrenWithAnnotationPath.forEach((child, childIndex) => {
          const isFirstChildOfFirstElement = isFirstRangeElement && childIndex === 0
          const isLastChildOfLastElement = isLastRangeElement && childIndex === allChildrenWithAnnotationPath.length - 1

          const childAnnotationPart = getAnnotationPart(child, isFirstChildOfFirstElement, isLastChildOfLastElement)
          if (childAnnotationPart) {
            annotations.push(childAnnotationPart)
          }
        })
      }
    })
    return annotations
  }, [] as AnnotationPart[])

  return annotations
}
