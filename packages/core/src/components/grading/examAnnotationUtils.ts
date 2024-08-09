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

      const annotations = collectAnnotations()
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

const collectAnnotations = () => {
  const selection = window.getSelection()

  const rangeChildren = selection && Array.from(selection?.getRangeAt(0).cloneContents().children)

  let annotations: AnnotationPart[] = []

  if (!rangeChildren?.length && selection) {
    const annotationAnchor = selection?.focusNode?.parentElement?.getAttribute('data-annotation-path')

    const range = selection?.getRangeAt(0)
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
    const temp = rangeChildren?.reduce((acc, child) => {
      const childsAnnotationPath = child.getAttribute('data-annotation-path')
      if (childsAnnotationPath) {
        const newElement = { annotationAnchor: childsAnnotationPath || '', selectedText: child.textContent || '' }
        return [...acc, newElement]
      } else {
        const allChildrenWithAnnotationPath = child.querySelectorAll('[data-annotation-path]')
        const kidElements = [] as AnnotationPart[]
        allChildrenWithAnnotationPath?.forEach(kid => {
          const dataAnnotationPath = kid.getAttribute('data-annotation-path')
          if (!dataAnnotationPath) {
            return acc
          }
          const newElement = { annotationAnchor: dataAnnotationPath, selectedText: kid.textContent || '' }
          kidElements.push(newElement)
        })
        return [...acc, ...kidElements]
      }
    }, [] as AnnotationPart[])

    annotations =
      temp?.map((element, index) => ({
        ...element,
        startOffset: index === 0 ? selection?.getRangeAt(0).startOffset : 0,
        length: index === temp.length - 1 ? selection?.getRangeAt(0).endOffset : element.selectedText.length
      })) || []

    return annotations
  }
}
