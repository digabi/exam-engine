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

    const hasOneTextElementSelected = hasOnlyOneTextElementSelected()

    if (selection && endNodePath && (true || hasOneTextElementSelected)) {
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

  const temp = rangeChildren?.reduce((acc, child) => {
    const childsAnnotationPath = child.getAttribute('data-annotation-path')
    if (childsAnnotationPath) {
      const newElement = { annotationPath: childsAnnotationPath || '', text: child.textContent || '' }
      return [...acc, newElement]
    } else {
      const allChildrenWithAnnotationPath = child.querySelectorAll('[data-annotation-path]')
      const kidElements = [] as AnnotationElement[]
      allChildrenWithAnnotationPath?.forEach(kid => {
        const dataAnnotationPath = kid.getAttribute('data-annotation-path')
        if (!dataAnnotationPath) {
          return acc
        }
        const newElement = { annotationPath: dataAnnotationPath, text: kid.textContent || '' }
        kidElements.push(newElement)
      })
      return [...acc, ...kidElements]
    }
  }, [] as AnnotationElement[])

  const annotations = temp?.map((element, index) => ({
    ...element,
    startOffset: index === 0 ? selection?.getRangeAt(0).startOffset : 0,
    length: index === temp.length - 1 ? selection?.getRangeAt(0).endOffset : element.text.length
  }))

  console.log('annotations', annotations)

  const startNode = selection?.anchorNode?.parentElement
  const endNode = selection?.focusNode?.parentElement
  console.log(startNode, endNode)
  return !visibleMarkTagExistsInSelection //&& startNode === endNode
}

type AnnotationElement = {
  annotationPath: string
  text: string
  index?: number
}
