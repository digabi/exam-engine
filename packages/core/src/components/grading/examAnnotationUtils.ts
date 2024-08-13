import React from 'react'
import { AnnotationPart } from '../../types/Score'
import { textAnnotationFromRange } from './editAnnotations'

export function onMouseDownForAnnotation(e: React.MouseEvent, mouseUpCallback: (e: any) => void) {
  function onMouseUpAfterAnswerMouseDown() {
    window.removeEventListener('mouseup', onMouseUpAfterAnswerMouseDown)

    /**
     * selection.anchorNode = where mouse is pressed down (chronologically first)
     * selection.getRangeAt(0).startContainer = where selection starts (first in DOM)
     */

    const selection = window.getSelection()
    const startNode = selection?.anchorNode?.parentElement
    const endNode = selection?.focusNode?.parentElement

    if (selection && startNode && endNode && selection.toString().length > 0) {
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
        console.log('extracted annotations', annotations)
        mouseUpCallback({
          annotationParts: annotations,
          displayNumber: startNodedisplayNumber,
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
  const childIsMark = rangeChildren?.some(
    child => child.tagName === 'MARK' && child.getAttribute('data-hidden') === 'false'
  )
  const childContainsMark = rangeChildren.some(child => child.querySelector('mark[data-hidden="false"]'))
  return childIsMark || childContainsMark
}

const getDisplayNumber = (node: HTMLElement) =>
  node?.closest('div[data-annotation-anchor]')?.getAttribute('data-annotation-anchor')

const isAnnotatable = (node: HTMLElement) => node?.getAttribute('data-annotation-path') && node.tagName !== 'MARK'

const extractAnnotationsFromSelection = (selection: Selection) => {
  const range = selection.getRangeAt(0)
  const rangeChildren = Array.from(selection?.getRangeAt(0).cloneContents().children)

  if (!rangeChildren?.length) {
    // selection is in one element
    const annotationAnchor = selection?.focusNode?.parentElement?.getAttribute('data-annotation-path')
    const startAndLength = textAnnotationFromRange(selection.focusNode?.parentElement as HTMLElement, range)
    return [
      {
        annotationAnchor,
        selectedText: selection?.toString() || '',
        startIndex: startAndLength?.startIndex || 0,
        length: startAndLength?.length || 0,
        isLastChild: true
      }
    ]
  } else {
    // selection is in multiple elements
    const annotations = rangeChildren?.reduce((acc, child, index, arr) => {
      const childsAnnotationPath = child.getAttribute('data-annotation-path')
      const isLastRangeChild = index === arr.length - 1
      if (childsAnnotationPath) {
        // child is a text node
        const newElement = {
          annotationAnchor: childsAnnotationPath,
          selectedText: child.textContent || '',
          startIndex: index === 0 ? range.startOffset : 0,
          length: isLastRangeChild ? range.endOffset : child.textContent?.length || 0,
          isLastChild: isLastRangeChild
        }
        return [...acc, newElement]
      } else {
        // child has children
        const allChildrenWithAnnotationPath = child.querySelectorAll('[data-annotation-path]')
        allChildrenWithAnnotationPath?.forEach((grandChild, kidIndex) => {
          const dataAnnotationPath = grandChild.getAttribute('data-annotation-path')
          if (dataAnnotationPath) {
            const isFirstOfAll = index === 0 && kidIndex === 0
            const isLastGrandChild = kidIndex === allChildrenWithAnnotationPath.length - 1
            const isLastOfAll = isLastRangeChild && isLastGrandChild
            const newElement = {
              annotationAnchor: dataAnnotationPath,
              selectedText: grandChild.textContent || '',
              startIndex: isFirstOfAll ? range.startOffset : 0,
              length: isLastOfAll ? range.endOffset : grandChild.textContent?.length || 0,
              isLastChild: isLastOfAll
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
