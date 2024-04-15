import React, { FormEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Annotation, TextAnnotation } from '../..'
import {
  annotationFromMousePosition,
  getOverlappingMessages,
  hasTextSelectedInAnswerText,
  imageAnnotationMouseDownInfo,
  isDesktopVersion,
  mergeAnnotation,
  NewImageAnnotation,
  preventDefaults,
  showAndPositionElement,
  textAnnotationFromRange,
  toggle
} from './editAnnotations'
import {
  renderAnnotations,
  renderImageAnnotationByImage,
  updateImageAnnotationMarkSize,
  wrapAllImages
} from '../../renderAnnotations'
import GradingAnswerAnnotationList from './GradingAnswerAnnotationList'
import { changeLanguage, initI18n, useExamTranslation } from '../../i18n'
import { updateLargeImageWarnings } from './largeImageDetector'
import { I18nextProvider } from 'react-i18next'
import { useCached } from '../../useCached'
import { AnswerCharacterCounter } from './AnswerCharacterCounter'
type Annotations = { pregrading: Annotation[]; censoring: Annotation[] }

type GradingRole = 'pregrading' | 'censoring'

type GradingAnswerProps = {
  answer: { type: 'richText' | 'text'; characterCount: number; value: string }
  language: string
  isReadOnly: boolean
  gradingRole: GradingRole
  maxLength?: number
  annotations: Annotations
  saveAnnotations: (annotations: Annotations) => void
  popupTopMargin?: number
}

export function GradingAnswer(props: GradingAnswerProps) {
  const i18n = useCached(() => initI18n(props.language))
  useEffect(changeLanguage(i18n, props.language))
  return (
    <I18nextProvider i18n={i18n}>
      <GradingAnswerWithTranslations {...props} />
    </I18nextProvider>
  )
}

function GradingAnswerWithTranslations({
  answer: { type, characterCount, value },
  language,
  isReadOnly,
  gradingRole,
  annotations,
  saveAnnotations,
  maxLength,
  popupTopMargin = 25
}: GradingAnswerProps) {
  const answerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLFormElement>(null)
  const messageRef = useRef<HTMLInputElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  let newAnnotationObject: Annotation | undefined
  let savedAnnotations: Annotations
  const imgAnnotationState: {
    start: NewImageAnnotation | undefined
    element: HTMLElement | undefined
    img: HTMLImageElement | undefined
  } = { start: undefined, element: undefined, img: undefined }
  let isEditAnnotationPopupVisible = false
  let annotationDataForTooltip: { index: number; role: GradingRole; message: string } | undefined
  let annotationPositionForPopup: DOMRect
  let hideTooltipTimeout: ReturnType<typeof setTimeout>
  let windowResizeTimeout: ReturnType<typeof setTimeout>
  let selectionChangeTimeout: ReturnType<typeof setTimeout>

  const [loadedCount, setLoadedCount] = useState(0)
  const [totalImages, setTotalImages] = useState(0)

  useEffect(() => {
    const images = document.querySelectorAll('img')
    setLoadedCount(0)
    setTotalImages(images.length)
    function checkAllImagesLoaded() {
      setLoadedCount(prevCount => prevCount + 1)
    }

    images.forEach(img => {
      img.addEventListener('load', checkAllImagesLoaded)
    })

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', checkAllImagesLoaded)
      })
    }
  }, [value])

  useLayoutEffect(() => {
    if (answerRef.current && tooltipRef.current && popupRef.current) {
      savedAnnotations = annotations
      toggle(tooltipRef.current, false)
      toggle(popupRef.current, false)
      renderAnswerWithAnnotations(savedAnnotations)
      answerRef.current.setAttribute('lang', language)
      document.addEventListener('selectionchange', onSelectionChangeForMobileDevices)
    }

    window.onresize = () => {
      clearTimeout(windowResizeTimeout)
      windowResizeTimeout = setTimeout(() => updateLargeImageWarnings(answerRef.current!), 1000)
    }
    return () => {
      window.removeEventListener('keydown', onKeyUpInAnnotationPopup)
      window.removeEventListener('mouseup', onWindowMouseUpAfterAnswerMouseDown)
      window.removeEventListener('mousemove', onMouseMoveForImageAnnotation)
    }
  })

  const { t } = useExamTranslation()
  return (
    <div onClick={e => onAnnotationOrListClick(e)} className="e-grading-answer-wrapper">
      {totalImages !== 0 && loadedCount !== totalImages && (
        <h5 className="loading-images">
          {t('grading.loading-images')} ({loadedCount}/{totalImages})
        </h5>
      )}
      <div
        className="e-grading-answer e-line-height-l e-mrg-b-1"
        ref={answerRef}
        onMouseDown={e => onAnswerMouseDown(e)}
        onMouseOver={e => onMouseOverAnnotation(e.target as HTMLElement)}
      />
      <AnswerCharacterCounter characterCount={characterCount} maxLength={maxLength} />
      <GradingAnswerAnnotationList
        censoring={annotations.censoring}
        pregrading={annotations.pregrading}
        singleGrading={gradingRole === 'pregrading'}
      />
      <form
        style={{ display: 'none' }}
        ref={popupRef}
        className="e-grading-answer-popup e-grading-answer-add-annotation"
        onSubmit={e => onSubmitAnnotation(e)}
      >
        <input
          onFocus={() => onNewAnnotationMessageFocus()}
          name="message"
          className="e-grading-answer-add-annotation-text"
          type="text"
          ref={messageRef}
        />
        <button className="e-grading-answer-add-annotation-button" type="submit" data-i18n="arpa.annotate">
          {t('grading.annotate')}
        </button>
        <button
          className="e-grading-answer-close-popup"
          onClick={e => {
            e.preventDefault()
            hideAnnotationPopupAndRefresh()
          }}
        >
          ×
        </button>
      </form>
      <div
        style={{ display: 'none' }}
        ref={tooltipRef}
        className="e-grading-answer-tooltip e-grading-answer-popup"
        onMouseOver={onMouseOverTooltip}
        onMouseOut={hideTooltip}
      >
        <span onClick={e => editExistingAnnotation(e)} className="e-grading-answer-tooltip-label"></span>
        <button onClick={e => removeAnnotation(e)} className="e-grading-answer-tooltip-remove">
          ×
        </button>
      </div>
    </div>
  )

  function onAnnotationOrListClick(e: React.MouseEvent<HTMLDivElement>) {
    const element = e.target
    if (element instanceof HTMLElement) {
      if (element.tagName === 'MARK') {
        if (!imgAnnotationState.element) {
          showTooltip(element)
        }
      } else if (element.tagName === 'LI') {
        const index = element.dataset.listNumber?.replace(')', '')
        const mark = document.querySelector<HTMLElement>(`.e-annotation[data-index="${index}"]`)!
        showTooltip(mark)
        mark.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } else if (annotationDataForTooltip) {
        hideTooltip()
      }
    }
  }

  function editExistingAnnotation(e: React.MouseEvent<HTMLSpanElement>) {
    if ((e.target as HTMLElement).closest('.editable')) {
      toggle(tooltipRef.current!, false)
      showExistingAnnotationPopup(annotationPositionForPopup)
    }
  }
  function removeAnnotation(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    e.preventDefault()
    hideTooltip()
    savedAnnotations[annotationDataForTooltip!.role].splice(annotationDataForTooltip!.index, 1)
    annotationDataForTooltip = undefined
    saveAnnotations(savedAnnotations)
  }
  function hideTooltip() {
    hideTooltipTimeout = setTimeout(() => {
      toggle(tooltipRef.current!, false)
    }, 400)
  }

  function onMouseOverTooltip() {
    clearTimeout(hideTooltipTimeout)
  }
  function onMouseOutFromTooltip(e: MouseEvent) {
    const target = e.target as Element
    if (target.tagName === 'MARK') {
      clearTimeout(hideTooltipTimeout)
      hideTooltip()
    }
    answerRef.current!.removeEventListener('mouseout', onMouseOutFromTooltip)
  }

  function showTooltip(target: HTMLElement) {
    clearTimeout(hideTooltipTimeout)
    const tooltip = tooltipRef.current!
    const { type, listIndex, message } = target.dataset
    tooltip.classList.toggle('editable', !isReadOnly && type === gradingRole)
    annotationPositionForPopup = target.getBoundingClientRect()
    showAndPositionElement(annotationPositionForPopup, answerRef.current!, tooltip, popupTopMargin)
    tooltip.querySelector('.e-grading-answer-tooltip-label')!.textContent = message || '–'
    annotationDataForTooltip = { index: Number(listIndex), role: type as GradingRole, message: message || '' }
    answerRef.current!.addEventListener('mouseout', onMouseOutFromTooltip)
  }

  function onMouseOverAnnotation(target: HTMLElement) {
    const markElement = target.closest('mark')
    if (
      markElement &&
      !isEditAnnotationPopupVisible &&
      (!hasTextSelectedInAnswerText() || isReadOnly) &&
      !imgAnnotationState.element
    ) {
      showTooltip(markElement)
    }
  }
  function showAnnotationPopup(rect: DOMRect, message: string) {
    annotationDataForTooltip = undefined
    setupAnnotationPopup(rect, message)
  }
  function showExistingAnnotationPopup(rect: DOMRect) {
    setupAnnotationPopup(rect, annotationDataForTooltip!.message)
  }
  function setupAnnotationPopup(rect: DOMRect, message: string) {
    // Could be active from previous popup
    window.removeEventListener('keydown', onKeyUpInAnnotationPopup)
    showAndPositionElement(rect, answerRef.current!, popupRef.current!, popupTopMargin)
    const inputElement = messageRef.current!
    inputElement.value = message
    inputElement.focus()
    isEditAnnotationPopupVisible = true
    window.addEventListener('keydown', onKeyUpInAnnotationPopup)
  }

  function hideAnnotationPopupAndRefresh() {
    newAnnotationObject = undefined
    imgAnnotationState.element = undefined
    imgAnnotationState.img = undefined
    isEditAnnotationPopupVisible = false
    window.removeEventListener('keydown', onKeyUpInAnnotationPopup)
    toggle(popupRef.current!, false)
    renderAnswerWithAnnotations(savedAnnotations)
  }
  function onAnswerMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // Do annotations only with left mouse buttons and when permitted
    if (isReadOnly || e.button !== 0) {
      return
    }
    window.addEventListener('mouseup', onWindowMouseUpAfterAnswerMouseDown)
    const target = e.target as Element
    const img = target.closest('.e-annotation-wrapper')?.querySelector<HTMLImageElement>('img') || undefined
    if (!img) {
      return
    }
    img.addEventListener('dragstart', preventDefaults) // Prevent dragging images when marking image annotations
    imgAnnotationState.start = imageAnnotationMouseDownInfo(e, img)
    imgAnnotationState.img = img
    window.addEventListener('mousemove', onMouseMoveForImageAnnotation)
  }

  function onWindowMouseUpAfterAnswerMouseDown() {
    imgAnnotationState.img?.removeEventListener('dragstart', preventDefaults)
    window.removeEventListener('mousemove', onMouseMoveForImageAnnotation)
    window.removeEventListener('mouseup', onWindowMouseUpAfterAnswerMouseDown)

    // Image annotation is being created since shape exists
    if (imgAnnotationState.element) {
      showAnnotationPopup(imgAnnotationState.element?.getBoundingClientRect(), '')
      return
    }

    // Text annotation
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      const position = textAnnotationFromRange(answerRef.current, range)
      if (!position) {
        return
      }
      const message = getOverlappingMessages(savedAnnotations[gradingRole], position.startIndex, position.length)
      newAnnotationObject = { ...position, type: 'text', message }
      showAnnotationPopup(range.getBoundingClientRect(), message)
      const newAnnotations = { ...savedAnnotations }
      newAnnotations[gradingRole] = mergeAnnotation(
        answerRef.current,
        newAnnotationObject,
        savedAnnotations[gradingRole] as TextAnnotation[]
      )
      renderAnswerWithAnnotations(newAnnotations)
    }
  }
  // Only used for touch devices
  function onNewAnnotationMessageFocus() {
    if (isDesktopVersion()) {
      return
    }
    if (answerRef.current) {
      const newAnnotations = { ...savedAnnotations }
      newAnnotations[gradingRole] = mergeAnnotation(
        answerRef.current,
        newAnnotationObject! as TextAnnotation,
        savedAnnotations[gradingRole] as TextAnnotation[]
      )
      renderAnswerWithAnnotations(newAnnotations)
    }
  }
  function onSelectionChangeForMobileDevices() {
    if (isDesktopVersion()) {
      return
    }
    clearTimeout(selectionChangeTimeout)
    selectionChangeTimeout = setTimeout(onSelectionChangeAfterThrottle, 500)
  }

  function onSelectionChangeAfterThrottle() {
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      const position = textAnnotationFromRange(answerRef.current, range)
      if (!position) {
        return
      }
      const message = getOverlappingMessages(savedAnnotations[gradingRole], position.startIndex, position.length)
      isEditAnnotationPopupVisible = true
      const inputElement = messageRef.current!
      inputElement.value = message
      showAndPositionElement(range.getBoundingClientRect(), answerRef.current, popupRef.current!, popupTopMargin)
      newAnnotationObject = { ...position, type: 'text', message }
    }
  }
  function onMouseMoveForImageAnnotation(e: MouseEvent) {
    preventDefaults(e)
    newAnnotationObject = annotationFromMousePosition(e, imgAnnotationState.start!)
    // Create shape on first mouse move and resize after that
    if (imgAnnotationState.element) {
      updateImageAnnotationMarkSize(imgAnnotationState.element, newAnnotationObject)
    } else {
      imgAnnotationState.element = renderImageAnnotationByImage(
        imgAnnotationState.img!,
        '',
        newAnnotationObject,
        gradingRole,
        999
      )
    }
  }

  function renderAnswerWithAnnotations(annotations: Annotations) {
    const container = answerRef.current!
    if (type === 'richText') {
      container.innerHTML = value
      wrapAllImages(container)
      updateLargeImageWarnings(container)
    } else {
      container.textContent = value
    }
    renderAnnotations(container, annotations.pregrading, annotations.censoring, false)
  }

  function onSubmitAnnotation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = messageRef.current!.value
    if (annotationDataForTooltip) {
      // Editing existing annotation message by clicking tooltip
      savedAnnotations[annotationDataForTooltip.role][annotationDataForTooltip.index].message = message
    } else {
      // Saving new annotation
      savedAnnotations[gradingRole] = mergeAnnotation(
        answerRef.current!,
        { ...newAnnotationObject!, message } as TextAnnotation,
        (savedAnnotations[gradingRole] as TextAnnotation[]) || []
      )
    }
    toggle(popupRef.current!, false)
    saveAnnotations(savedAnnotations)
  }

  function onKeyUpInAnnotationPopup(e: KeyboardEvent) {
    if (e.key === 'Escape' && isEditAnnotationPopupVisible) {
      e.stopPropagation()
      hideAnnotationPopupAndRefresh()
    }
  }
}
