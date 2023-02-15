import React, { FormEvent, useLayoutEffect, useRef } from 'react'
import { Annotation } from '../..'
import {
  annotationFromMousePosition,
  hasTextSelectedInAnswerText,
  imageAnnotationMouseDownInfo,
  mergeAnnotation,
  NewImageAnnotation,
  popupPosition,
  selectionHasNothingToUnderline,
  textAnnotationFromRange,
} from './editAnnotations'
import {
  renderAnnotations,
  renderImageAnnotationByImage,
  updateImageAnnotationMarkSize,
  wrapAllImages,
} from '../../renderAnnotations'

type Annotations = { pregrading: Annotation[]; censoring: Annotation[] }

function preventDefaults(e: Event) {
  e.preventDefault()
  e.stopPropagation()
}

export function GradingAnswer({
  type,
  annotations,
  saveAnnotations,
  value,
}: {
  type: 'richText' | 'text'
  value: string
  annotations: Annotations
  saveAnnotations: (annotations: Annotations) => void
}) {
  const answerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLInputElement>(null)
  let newAnnotationObject: Annotation | undefined
  // let isMouseDown = false
  let latestSavedAnnotations: Annotations
  let mouseDownInfo: NewImageAnnotation
  let newImageAnnotationMark: HTMLElement | undefined
  let imageAtHand: HTMLImageElement | undefined
  let isPopupVisible = false

  useLayoutEffect(() => {
    if (answerRef.current) {
      latestSavedAnnotations = annotations
      renderAnswerWithAnnotations(latestSavedAnnotations)
    }
  })

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="answer e-grading-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
        ref={answerRef}
        onKeyUp={(e) => onKeyUp(e)}
        onMouseDown={(e) => onMouseDown(e)}
      />
      <div style={{ display: 'none', position: 'absolute' }} ref={popupRef} className="popup add-annotation-popup">
        <form onSubmit={(e) => onSubmit(e)}>
          <input name="message" className="add-annotation-text" type="text" ref={messageRef} />
          <i className="fa fa-comment"></i>
          <button type="submit" data-i18n="arpa.annotate">
            Merkitse
          </button>
        </form>
      </div>
    </div>
  )

  function showAnnotationPopup(rect: DOMRect) {
    Object.assign(popupRef.current!.style, popupPosition(rect, answerRef.current!), {
      display: 'block',
    })
    const inputElement = messageRef.current!
    inputElement.value = ''
    inputElement.focus()
    isPopupVisible = true
  }

  function closePopupAndRefresh() {
    newAnnotationObject = undefined
    newImageAnnotationMark = undefined
    imageAtHand = undefined
    isPopupVisible = false
    popupRef.current!.style.display = 'none'
    renderAnswerWithAnnotations(latestSavedAnnotations)
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    window.addEventListener('mouseup', onWindowMouseUp)

    if (e.button !== 0) {
      return
    }
    const target = e.target as Element
    imageAtHand = target.closest('.e-annotation-wrapper')?.querySelector<HTMLImageElement>('img') || undefined
    if (!imageAtHand) {
      return
    }
    imageAtHand.addEventListener('dragstart', preventDefaults)
    mouseDownInfo = imageAnnotationMouseDownInfo(e, imageAtHand)

    window.addEventListener('mousemove', onMouseMoveForImageAnnotation)
  }

  function onWindowMouseUp(e: MouseEvent) {
    imageAtHand?.removeEventListener('dragstart', preventDefaults)
    window.removeEventListener('mousemove', onMouseMoveForImageAnnotation)
    window.removeEventListener('mouseup', onWindowMouseUp)

    if (isPopupVisible && (e.target as Element).closest('.popup') === null) {
      closePopupAndRefresh()
      return
    }

    if (newImageAnnotationMark) {
      showAnnotationPopup(newImageAnnotationMark?.getBoundingClientRect()!)
      return
    }

    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      if (selectionHasNothingToUnderline(range)) {
        return
      }
      const position = textAnnotationFromRange(answerRef.current, range)
      newAnnotationObject = { ...position, type: 'text', message: '' }
      showAnnotationPopup(range.getBoundingClientRect())
      renderAnswerWithAnnotations({
        pregrading: latestSavedAnnotations.pregrading,
        censoring: mergeAnnotation(answerRef.current, newAnnotationObject, latestSavedAnnotations.censoring),
      })
    }
  }

  function onMouseMoveForImageAnnotation(e: MouseEvent) {
    preventDefaults(e)
    newAnnotationObject = annotationFromMousePosition(e, mouseDownInfo)

    if (newImageAnnotationMark) {
      updateImageAnnotationMarkSize(newImageAnnotationMark, newAnnotationObject)
    } else {
      newImageAnnotationMark = renderImageAnnotationByImage(imageAtHand!, '', newAnnotationObject, 'censoring')
    }
  }

  function renderAnswerWithAnnotations(annotations: Annotations) {
    const container = answerRef.current!
    if (type === 'richText') {
      container.innerHTML = value
    } else {
      container.textContent = value
    }
    wrapAllImages(container)
    renderAnnotations(container, annotations.pregrading, annotations.censoring)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = messageRef.current!.value
    latestSavedAnnotations.censoring = mergeAnnotation(
      answerRef.current!,
      { ...newAnnotationObject!, message },
      latestSavedAnnotations.censoring || []
    )

    saveAnnotations(latestSavedAnnotations)
    closePopupAndRefresh()
  }

  function onKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && newAnnotationObject) {
      closePopupAndRefresh()
    }
  }
}
