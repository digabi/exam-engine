import React, { FormEvent, useLayoutEffect, useRef } from 'react'
import { Annotation, ImageAnnotation, TextAnnotation } from '../..'
import AnnotationList from '../results/internal/AnnotationList'
import {
  textAnnotationFromRange,
  popupPosition,
  hasTextSelectedInAnswerText,
  mergeAnnotation,
  imageAnnotationMouseDownInfo,
  annotationFromMousePosition,
  NewImageAnnotation,
  selectionHasNothingToUnderline,
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
  let newAnnotation: TextAnnotation | undefined
  // let isMouseDown = false
  let latestSavedAnnotations: Annotations
  let mouseDownInfo: NewImageAnnotation
  let newImageAnnotationMark: HTMLElement | undefined
  let imageAtHand: HTMLImageElement | undefined
  let newImageAnnotation: ImageAnnotation | undefined

  useLayoutEffect(() => {
    if (answerRef.current) {
      latestSavedAnnotations = annotations
      renderAnswerWithAnnotations(latestSavedAnnotations)
    }
  })

  return (
    <div
      onKeyUp={(e) => onKeyUp(e)}
      style={{ position: 'relative' }}
      className="answer e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
    >
      {type === 'richText' ? (
        <div onMouseUp={onMouseUp} ref={answerRef} onMouseDown={(e) => onMouseDown(e)} />
      ) : (
        <span className="answer text-answer text-answer--single-line">
          <span className="e-inline-block" onMouseUp={onMouseUp} ref={answerRef}></span>
        </span>
      )}
      <div style={{ display: 'none', position: 'absolute' }} ref={popupRef} className="popup add-annotation-popup">
        <form onSubmit={(e) => onSubmit(e)}>
          <input name="message" className="add-annotation-text" type="text" ref={messageRef} />
          <i className="fa fa-comment"></i>
          <button type="submit" data-i18n="arpa.annotate">
            Merkitse
          </button>
        </form>
      </div>
      <AnnotationList />
    </div>
  )

  function showAnnotationPopup(rect: DOMRect) {
    Object.assign(popupRef.current!.style, popupPosition(rect, answerRef.current!), {
      display: 'block',
    })
    const inputElement = messageRef.current!
    inputElement.value = ''
    inputElement.focus()
  }

  function closePopupAndRefresh() {
    console.log('close popup')
    newAnnotation = undefined
    popupRef.current!.style.display = 'none'
    renderAnswerWithAnnotations(latestSavedAnnotations)
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
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

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onWindowMouseUp)
  }

  function onWindowMouseUp() {
    imageAtHand?.removeEventListener('dragstart', preventDefaults)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onWindowMouseUp)

    showAnnotationPopup(newImageAnnotationMark?.getBoundingClientRect()!)
  }

  function onMouseMove(e: MouseEvent) {
    preventDefaults(e)
    newImageAnnotation = annotationFromMousePosition(e, mouseDownInfo)

    if (newImageAnnotationMark) {
      updateImageAnnotationMarkSize(newImageAnnotationMark, newImageAnnotation)
    } else {
      newImageAnnotationMark = renderImageAnnotationByImage(imageAtHand!, '', newImageAnnotation, 'censoring')
    }
  }

  function onMouseUp() {
    if (newAnnotation) {
      closePopupAndRefresh()
    }
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      if (selectionHasNothingToUnderline(range)) {
        return
      }
      const position = textAnnotationFromRange(answerRef.current, range)
      newAnnotation = { ...position, type: 'text', message: '' }
      showAnnotationPopup(range.getBoundingClientRect())
      renderAnswerWithAnnotations({
        pregrading: latestSavedAnnotations.pregrading,
        censoring: mergeAnnotation(answerRef.current, newAnnotation, latestSavedAnnotations.censoring),
      })
    }
  }

  function renderAnswerWithAnnotations(annotations: Annotations) {
    const container = answerRef.current!
    container.innerHTML = value
    wrapAllImages(container)
    renderAnnotations(container, annotations.pregrading, annotations.censoring)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = messageRef.current!.value

    if (newImageAnnotation) {
      newImageAnnotation.message = message
      latestSavedAnnotations.censoring.push(newImageAnnotation)
      saveAnnotations(latestSavedAnnotations)
      closePopupAndRefresh()
      newImageAnnotation = undefined
      newImageAnnotationMark = undefined
      imageAtHand = undefined
      return
    }
    newAnnotation!.message = message
    latestSavedAnnotations.censoring = mergeAnnotation(
      answerRef.current!,
      newAnnotation!,
      latestSavedAnnotations.censoring || []
    )

    saveAnnotations(latestSavedAnnotations)
    closePopupAndRefresh()
  }

  function onKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && newAnnotation) {
      closePopupAndRefresh()
    }
  }
}
