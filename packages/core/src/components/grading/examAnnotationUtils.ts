import { textAnnotationFromRange } from './editAnnotations'
import React from 'react'

export function onMouseDownForAnnotation(e: React.MouseEvent, mouseUpCallback: (e: any) => void) {
  function onMouseUpAfterAnswerMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement
    window.removeEventListener('mouseup', onMouseUpAfterAnswerMouseDown)

    // Text annotation
    const selection = window.getSelection()
    if (selection && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      const position = textAnnotationFromRange(target, range)
      if (!position) {
        return
      }
      const selectedText = selection.toString()
      mouseUpCallback({ ...position, selectedText })
    }
  }

  // Do annotations only with left mouse buttons
  if (e.button !== 0) {
    return
  }
  window.addEventListener('mouseup', onMouseUpAfterAnswerMouseDown)
}

export function hasTextSelectedInAnswerText(): boolean {
  const selection = window.getSelection()

  return (
    selection !== null &&
    selectionInAnswerText(selection) &&
    (isRangeSelection(selection) || textSelectedInRange(selection))
  )

  function selectionInAnswerText(sel: Selection) {
    if (sel.type === 'None' || sel.type === 'Caret' || sel.rangeCount === 0) {
      return false
    }
    const startContainer = sel.getRangeAt(0).startContainer
    const endContainer = sel.getRangeAt(0).endContainer
    const startParent = startContainer.parentElement
    const endParent = endContainer.parentElement
    const markTagExistsInSelection = Array.from(sel.getRangeAt(0).cloneContents().children).some(
      child => child.tagName === 'MARK' && child.getAttribute('data-annotation-id')
    )
    return (
      sel.rangeCount > 0 && startParent === endParent && startParent?.tagName !== 'MARK' && !markTagExistsInSelection
    )
  }

  function isRangeSelection(sel: Selection) {
    return sel?.type === 'Range'
  }

  function textSelectedInRange(sel: Selection) {
    const range = sel?.getRangeAt(0)
    return !!sel.rangeCount && range.toString().length > 0
  }
}
