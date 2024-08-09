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
    // const endNode = selection?.focusNode?.parentElement
    // const endNodePath = endNode?.getAttribute('data-annotation-path')

    if (selection && selection.toString().length > 0) {
      const displayNumber =
        startNode?.parentElement?.closest('div[data-annotation-anchor]')?.getAttribute('data-annotation-anchor') || ''

      const annotations = collectAnnotationsFromSelection()
      console.log('annotations', annotations)
      mouseUpCallback({ annotationParts: annotations, displayNumber })
    }
  }

  // Do annotations only with left mouse buttons
  if (e.button !== 0) {
    return
  }
  window.addEventListener('mouseup', onMouseUpAfterAnswerMouseDown)
}

const collectAnnotationsFromSelection = () => {
  const selection = window.getSelection()
  const range = selection?.getRangeAt(0)
  if (!selection || !range) {
    return []
  }

  const rangeChildren = selection && Array.from(selection?.getRangeAt(0).cloneContents().children)

  if (!rangeChildren?.length) {
    // selection is in one element
    const annotationAnchor = selection?.focusNode?.parentElement?.getAttribute('data-annotation-path')
    const startAndLength = textAnnotationFromRange(selection.focusNode?.parentElement as HTMLElement, range)
    return [
      {
        annotationAnchor,
        selectedText: selection?.toString() || '',
        startOffset: startAndLength?.startIndex || 0,
        length: startAndLength?.length
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
          annotationAnchor: childsAnnotationPath || '',
          selectedText: child.textContent || '',
          startOffset: index === 0 ? range.startOffset : 0,
          length: isLastRangeChild ? range.endOffset : child.textContent?.length
        }
        return [...acc, newElement]
      } else {
        // child has children
        const allChildrenWithAnnotationPath = child.querySelectorAll('[data-annotation-path]')
        allChildrenWithAnnotationPath?.forEach((grandChild, kidIndex) => {
          const dataAnnotationPath = grandChild.getAttribute('data-annotation-path')
          if (dataAnnotationPath) {
            const isFirstOfAll = index === 0 && kidIndex === 0
            const isLastGrandCHild = kidIndex === allChildrenWithAnnotationPath.length - 1
            const isLastOfAll = isLastRangeChild && isLastGrandCHild
            const newElement = {
              annotationAnchor: dataAnnotationPath,
              selectedText: grandChild.textContent || '',
              startOffset: isFirstOfAll ? range.startOffset : 0,
              length: isLastOfAll ? range.endOffset : grandChild.textContent?.length
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
