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
    const initialStartNode = selection?.anchorNode?.parentElement
    const initialEndNode = selection?.focusNode?.parentElement

    if (selection && initialStartNode && initialEndNode && selection.toString().length > 0) {
      const isReversed = initialStartNode.compareDocumentPosition(initialEndNode) & Node.DOCUMENT_POSITION_PRECEDING
      const startNode = findAnnotatableNode(
        initialStartNode,
        isReversed ? 'previousElementSibling' : 'nextElementSibling'
      )
      const endNode = findAnnotatableNode(initialEndNode, isReversed ? 'nextElementSibling' : 'previousElementSibling')
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

const findAnnotatableNode = (
  node: HTMLElement,
  siblingDirection: 'nextElementSibling' | 'previousElementSibling'
): HTMLElement => {
  if (node.matches('.e-annotatable')) {
    return node
  }
  const sibling = node[siblingDirection] as HTMLElement | null
  if (sibling instanceof HTMLElement) {
    if (sibling.matches('.e-annotatable')) {
      return sibling
    }
    return (sibling.querySelector('.e-annotatable') as HTMLElement) || findAnnotatableNode(sibling, siblingDirection)
  }
  return node
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
  const range = selection.getRangeAt(0)
  const rangeChildren = Array.from(selection?.getRangeAt(0).cloneContents().children)
  const firstSelectedNodeInDOM = range.startContainer.parentElement
  if (!rangeChildren?.length) {
    // selection is plain text
    const annotationAnchor = selection?.focusNode?.parentElement?.getAttribute('data-annotation-path')
    const startAndLength = textAnnotationFromRange(firstSelectedNodeInDOM as HTMLElement, range)
    return [
      {
        annotationAnchor,
        selectedText: selection?.toString() || '',
        startIndex: startAndLength?.startIndex || 0,
        length: startAndLength?.length || 0
      }
    ] as AnnotationPart[]
  } else {
    // selection is in multiple elements
    const annotations = rangeChildren?.reduce((acc, child, index, arr) => {
      const childsAnnotationPath = child.getAttribute('data-annotation-path')
      const isLastRangeChild = index === arr.length - 1
      if (childsAnnotationPath) {
        // child is an annotable node, like <span> text </span>
        const textContent = child.textContent ?? ''
        const newElement = {
          annotationAnchor: childsAnnotationPath,
          selectedText: textContent,
          startIndex: index === 0 ? range.startOffset : 0,
          length: isLastRangeChild ? range.endOffset : textContent.length
        }
        return [...acc, newElement]
      } else {
        // child is a node with children, like <b> <span> text </span> </b>
        const allChildrenWithAnnotationPath = child.querySelectorAll('[data-annotation-path]')
        allChildrenWithAnnotationPath?.forEach((grandChild, kidIndex) => {
          const dataAnnotationPath = grandChild.getAttribute('data-annotation-path')
          const textContent = grandChild.textContent ?? ''
          if (dataAnnotationPath) {
            const isFirstOfAll = index === 0 && kidIndex === 0
            const isLastGrandChild = kidIndex === allChildrenWithAnnotationPath.length - 1
            const isLastOfAll = isLastRangeChild && isLastGrandChild
            const startAndLength = textAnnotationFromRange(firstSelectedNodeInDOM as HTMLElement, range)
            const newElement = {
              annotationAnchor: dataAnnotationPath,
              selectedText: textContent,
              startIndex: isFirstOfAll ? startAndLength?.startIndex || 0 : 0,
              length: isLastOfAll ? range.endOffset : textContent.length
            }
            acc.push(newElement)
          }
        })
        return acc
      }
    }, [] as AnnotationPart[])

    return annotations
  }
}
