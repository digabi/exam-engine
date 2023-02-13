import React, { FormEvent, useLayoutEffect, useRef } from 'react'
import { Annotation, TextAnnotation } from '../..'
import AnnotationList from '../results/internal/AnnotationList'
import {
  calculatePosition,
  getPopupCss,
  hasTextSelectedInAnswerText,
  mergeAnnotation,
  mouseDownForImageAnnotation,
  mouseMoveCalculations,
  NewImageAnnotation,
  selectionHasNothingToUnderline,
} from './editAnnotations'
import {
  renderAnnotations,
  renderImageAnnotationByImage,
  updateImageAnnotationMarkSize,
  wrapAllImages,
} from '../../renderAnnotations'
import * as _ from 'lodash-es'

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
  let newImageAnnotation: NewImageAnnotation
  let newImageAnnotationMark: HTMLElement | undefined
  let imageAtHand: HTMLImageElement | undefined

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

  function showAnnotationPopup(range: Range) {
    Object.assign(popupRef.current!.style, getPopupCss(range, answerRef.current!), {
      display: 'block',
    })
    const inputElement = messageRef.current!
    inputElement.value = ''
    inputElement.focus()
  }

  function closePopupAndRefresh() {
    newAnnotation = undefined
    popupRef.current!.style.display = 'none'
    renderAnswerWithAnnotations(latestSavedAnnotations)
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.button !== 0) {
      return
    }
    const target = e.target as Element
    const image = target.closest('img')
    if (image === null) {
      return
    }
    imageAtHand = image
    imageAtHand.addEventListener('dragstart', preventDefaults)
    newImageAnnotation = mouseDownForImageAnnotation(e, imageAtHand)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onWindowMouseUp)
  }

  function onWindowMouseUp() {
    imageAtHand?.removeEventListener('dragstart', preventDefaults)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onWindowMouseUp)
  }

  function onMouseMove(e: MouseEvent) {
    preventDefaults(e)
    const shape = mouseMoveCalculations(e, newImageAnnotation)

    if (newImageAnnotationMark) {
      updateImageAnnotationMarkSize(newImageAnnotationMark, shape)
    } else {
      newImageAnnotationMark = renderImageAnnotationByImage(imageAtHand!, '', shape, 'censoring')
    }
  }

  function onMouseUp() {
    // isMouseDown = false
    if (newAnnotation) {
      closePopupAndRefresh()
    }
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      if (selectionHasNothingToUnderline(range)) {
        return
      }
      const position = calculatePosition(answerRef.current, range)
      newAnnotation = { ...position, type: 'text', message: '' }
      showAnnotationPopup(range)
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
    newAnnotation!.message = messageRef.current!.value
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
