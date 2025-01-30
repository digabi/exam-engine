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

    if (rangeElements.length === 0) {
      const annotationAnchor = firstNode.getAttribute('data-annotation-path')
      if (!annotationAnchor) return annotations

      const startAndLength = textAnnotationFromRange(firstNode, range)
      annotations.push({
        annotationAnchor,
        selectedText: selection?.toString() ?? '',
        startIndex: startAndLength?.startIndex ?? 0,
        length: startAndLength?.length ?? 0
      })
    }

    rangeElements.forEach((element, elementIndex) => {
      const childsAnnotationPath = element.getAttribute('data-annotation-path')
      const isFirstRangeChild = rangeIndex === 0 && elementIndex === 0
      const isLastRangeChild = rangeIndex === ranges.length - 1 && elementIndex === rangeElements.length - 1
      if (childsAnnotationPath) {
        // child is an annotable node, like <span> text </span> or <e:formula>...</e:formula>
        const textContent = element.getAttribute('data-annotation-content') ?? element.textContent ?? ''
        const annotationPart = {
          annotationAnchor: childsAnnotationPath,
          selectedText: textContent,
          startIndex: isFirstRangeChild ? range.startOffset : 0,
          length: isLastRangeChild ? range.endOffset : textContent.length
        }
        annotations.push(annotationPart)
      } else {
        // child is a node with children, like <b> <span> text </span> </b>
        const allChildrenWithAnnotationPath = element.querySelectorAll('[data-annotation-path]')
        allChildrenWithAnnotationPath.forEach(child => {
          const dataAnnotationPath = child.getAttribute('data-annotation-path')
          const textContent = child.getAttribute('data-annotation-content') ?? child.textContent ?? ''
          if (dataAnnotationPath) {
            const startAndLength = textAnnotationFromRange(firstNode, range)
            const annotationPart = {
              annotationAnchor: dataAnnotationPath,
              selectedText: textContent,
              startIndex: isFirstRangeChild ? (startAndLength?.startIndex ?? 0) : 0,
              length: isLastRangeChild ? range.endOffset : textContent.length
            }
            annotations.push(annotationPart)
          }
        })
      }
    })
    return annotations
  }, [] as AnnotationPart[])

  return annotations
}
