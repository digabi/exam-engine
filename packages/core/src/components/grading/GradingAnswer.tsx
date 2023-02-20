import React, { FormEvent, useLayoutEffect, useRef } from 'react'
import { Annotation } from '../..'
import {
  annotationFromMousePosition,
  hasTextSelectedInAnswerText,
  imageAnnotationMouseDownInfo,
  mergeAnnotation,
  NewImageAnnotation,
  showAndPositionPopup,
  selectionHasNothingToUnderline,
  textAnnotationFromRange,
} from './editAnnotations'
import {
  renderAnnotations,
  renderImageAnnotationByImage,
  updateImageAnnotationMarkSize,
  wrapAllImages,
} from '../../renderAnnotations'
import GradingAnswerAnnotationList from './GradingAnswerAnnotationList'
import { useExamTranslation } from '../../i18n'
import { updateLargeImageWarnings } from './largeImageDetector'

type Annotations = { pregrading: Annotation[]; censoring: Annotation[] }

type GradingType = 'pregrading' | 'censoring'
export function GradingAnswer({
  isReadOnly,
  answerType,
  gradingRole,
  annotations,
  saveAnnotations,
  value,
  characterCount,
  maxLength,
}: {
  isReadOnly: boolean
  answerType: 'richText' | 'text'
  gradingRole: GradingType
  value: string
  characterCount: number
  maxLength?: number
  annotations: Annotations
  saveAnnotations: (annotations: Annotations) => void
}) {
  const answerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLFormElement>(null)
  const messageRef = useRef<HTMLInputElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  let newAnnotationObject: Annotation | undefined
  let savedAnnotations: Annotations
  let currentImageAnnotationStart: NewImageAnnotation
  let currentImageAnnotationElement: HTMLElement | undefined
  let currentImg: HTMLImageElement | undefined
  let isPopupVisible = false
  let closeTooltipTimeout: ReturnType<typeof setTimeout>
  let annotationDataForTooltip: { index: number; type: GradingType } | undefined
  let windowResizeTimeout: ReturnType<typeof setTimeout>

  useLayoutEffect(() => {
    if (answerRef.current) {
      savedAnnotations = annotations
      tooltipRef.current!.style.display = 'none'
      popupRef.current!.style.display = 'none'
      renderAnswerWithAnnotations(savedAnnotations)
      updateLargeImageWarnings(answerRef.current)
    }

    window.onresize = () => {
      clearTimeout(windowResizeTimeout)
      windowResizeTimeout = setTimeout(() => updateLargeImageWarnings(answerRef.current!), 1000)
    }
  })

  const { t } = useExamTranslation()
  const percentage = countSurplusPercentage(characterCount, maxLength)

  return (
    <div className="e-grading-answer-wrapper">
      <div
        className="e-grading-answer e-line-height-l e-mrg-b-1"
        ref={answerRef}
        onKeyUp={(e) => onKeyUp(e)}
        onMouseDown={(e) => onMouseDown(e)}
        onMouseOver={(e) => onMouseOver(e.target as HTMLElement)}
      />
      <div className="e-font-size-xs e-grading-answer-length">
        {t('answer-length', {
          count: characterCount,
        })}
        {percentage > 0 ? (
          <span className="e-grading-answer-max-length-surplus">
            {t('max-length-surplus', {
              maxLength,
              percentage,
            })}
          </span>
        ) : (
          ''
        )}
      </div>
      <GradingAnswerAnnotationList
        censoring={annotations.censoring}
        pregrading={annotations.pregrading}
        singleGrading={false}
      />
      <form
        style={{ display: 'none' }}
        ref={popupRef}
        className="e-grading-answer-popup e-grading-answer-add-annotation"
        onSubmit={(e) => onSubmit(e)}
      >
        <input name="message" className="e-grading-answer-add-annotation-text" type="text" ref={messageRef} />
        <button className="e-grading-answer-add-annotation-button" type="submit" data-i18n="arpa.annotate">
          Merkitse
        </button>
      </form>
      <div
        style={{ display: 'none' }}
        ref={tooltipRef}
        className="e-grading-answer-tooltip e-grading-answer-popup"
        onMouseOver={onMouseOverTooltip}
        onMouseOut={closeTooltip}
      >
        <span className="e-grading-answer-tooltip-label">tooltip text</span>
        <button onClick={(e) => removeAnnotation(e)} className="e-grading-answer-tooltip-remove">
          ×
        </button>
      </div>
    </div>
  )

  function removeAnnotation(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    e.preventDefault()
    closeTooltip()
    savedAnnotations[annotationDataForTooltip!.type].splice(annotationDataForTooltip!.index, 1)
    annotationDataForTooltip = undefined
    saveAnnotations(savedAnnotations)
  }
  function closeTooltip() {
    closeTooltipTimeout = setTimeout(() => {
      tooltipRef.current!.style.display = 'none'
    }, 400)
  }

  function onMouseOverTooltip() {
    clearTimeout(closeTooltipTimeout)
  }
  function onMouseOut(e: MouseEvent) {
    const target = e.target as Element
    if (target.tagName === 'MARK') {
      clearTimeout(closeTooltipTimeout)
      closeTooltip()
    }
    answerRef.current!.removeEventListener('mouseout', onMouseOut)
  }

  function showTooltip(target: HTMLElement) {
    clearTimeout(closeTooltipTimeout)
    const tooltip = tooltipRef.current!
    const { type, listIndex, message } = target.dataset
    tooltip.querySelector<HTMLDivElement>('.e-grading-answer-tooltip-remove')!.style.display =
      isReadOnly || type !== gradingRole ? 'none' : 'initial'
    const rect = target.getBoundingClientRect()
    Object.assign(tooltip.style, showAndPositionPopup(rect, answerRef.current!))
    tooltip.querySelector('.e-grading-answer-tooltip-label')!.textContent = message || '–'
    annotationDataForTooltip = { index: Number(listIndex), type: type as GradingType }
    answerRef.current!.addEventListener('mouseout', onMouseOut)
  }

  function onMouseOver(target: HTMLElement) {
    if (
      target.tagName === 'MARK' &&
      !isPopupVisible &&
      (!hasTextSelectedInAnswerText() || isReadOnly) &&
      !currentImageAnnotationElement
    ) {
      showTooltip(target)
    }
  }
  function showAnnotationPopup(rect: DOMRect) {
    Object.assign(popupRef.current!.style, showAndPositionPopup(rect, answerRef.current!))
    const inputElement = messageRef.current!
    inputElement.value = ''
    inputElement.focus()
    isPopupVisible = true
  }

  function closePopupAndRefresh() {
    newAnnotationObject = undefined
    currentImageAnnotationElement = undefined
    currentImg = undefined
    isPopupVisible = false
    popupRef.current!.style.display = 'none'
    renderAnswerWithAnnotations(savedAnnotations)
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (isReadOnly) {
      return
    }
    window.addEventListener('mouseup', onWindowMouseUp)

    if (e.button !== 0) {
      return
    }
    const target = e.target as Element
    currentImg = target.closest('.e-annotation-wrapper')?.querySelector<HTMLImageElement>('img') || undefined
    if (!currentImg) {
      return
    }
    currentImg.addEventListener('dragstart', preventDefaults)
    currentImageAnnotationStart = imageAnnotationMouseDownInfo(e, currentImg)

    window.addEventListener('mousemove', onMouseMoveForImageAnnotation)
  }

  function onWindowMouseUp(e: MouseEvent) {
    currentImg?.removeEventListener('dragstart', preventDefaults)
    window.removeEventListener('mousemove', onMouseMoveForImageAnnotation)
    window.removeEventListener('mouseup', onWindowMouseUp)

    if (isPopupVisible && (e.target as Element).closest('.popup') === null) {
      closePopupAndRefresh()
      return
    }

    if (currentImageAnnotationElement) {
      showAnnotationPopup(currentImageAnnotationElement?.getBoundingClientRect()!)
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
      const newAnnotations = { ...savedAnnotations }
      newAnnotations[gradingRole] = mergeAnnotation(
        answerRef.current,
        newAnnotationObject,
        savedAnnotations[gradingRole]
      )
      renderAnswerWithAnnotations(newAnnotations)
    }
  }

  function onMouseMoveForImageAnnotation(e: MouseEvent) {
    preventDefaults(e)
    newAnnotationObject = annotationFromMousePosition(e, currentImageAnnotationStart)
    if (currentImageAnnotationElement) {
      updateImageAnnotationMarkSize(currentImageAnnotationElement, newAnnotationObject)
    } else {
      currentImageAnnotationElement = renderImageAnnotationByImage(
        currentImg!,
        '',
        newAnnotationObject,
        gradingRole,
        999
      )
    }
  }

  function renderAnswerWithAnnotations(annotations: Annotations) {
    const container = answerRef.current!
    if (answerType === 'richText') {
      container.innerHTML = value
    } else {
      container.textContent = value
    }
    wrapAllImages(container)
    renderAnnotations(container, annotations.pregrading, annotations.censoring)
    //TODO make titles optional for annotation rendering
    container.querySelectorAll('mark').forEach((mark) => mark.removeAttribute('title'))
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = messageRef.current!.value
    savedAnnotations[gradingRole] = mergeAnnotation(
      answerRef.current!,
      { ...newAnnotationObject!, message },
      savedAnnotations[gradingRole] || []
    )
    popupRef.current!.style.display = 'none'
    saveAnnotations(savedAnnotations)
  }

  function onKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && newAnnotationObject) {
      closePopupAndRefresh()
    }
  }
}

function preventDefaults(e: Event) {
  e.preventDefault()
  e.stopPropagation()
}

function countSurplusPercentage(characters: number, maxCharacters: number | undefined | null): number {
  if (!maxCharacters || characters <= maxCharacters) {
    return 0
  }
  return Math.floor((100 * characters) / maxCharacters - 100)
}
