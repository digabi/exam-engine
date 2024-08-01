import React from 'react'
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
    const endNodePath = endNode?.getAttribute('data-annotation-path')

    if (selection && endNodePath && hasOnlyOneTextElementSelected()) {
      const range = selection.getRangeAt(0)
      const displayNumber =
        startNode?.parentElement?.closest('div[data-annotation-anchor]')?.getAttribute('data-annotation-anchor') || ''

      const startAndLength = textAnnotationFromRange(selection.focusNode?.parentElement as HTMLElement, range)

      if (!startAndLength || !startAndLength?.length) {
        return
      }

      const position = {
        startIndex: startAndLength.startIndex,
        length: startAndLength?.length,
        selectedText: selection.toString()
      }
      mouseUpCallback({ ...position, annotationAnchor: endNodePath, displayNumber })
    }
  }

  // Do annotations only with left mouse buttons
  if (e.button !== 0) {
    return
  }
  window.addEventListener('mouseup', onMouseUpAfterAnswerMouseDown)
}

function hasOnlyOneTextElementSelected(): boolean {
  const selection = window.getSelection()

  const rangeChildren = selection && Array.from(selection?.getRangeAt(0).cloneContents().children)
  const visibleMarkTagExistsInSelection = rangeChildren?.some(
    child => child.tagName === 'MARK' && child.getAttribute('data-hidden') === 'false'
  )

  const startNode = selection?.anchorNode?.parentElement
  const endNode = selection?.focusNode?.parentElement
  return !visibleMarkTagExistsInSelection && startNode === endNode
}
