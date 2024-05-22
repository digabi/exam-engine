import * as _ from 'lodash-es'
import { Annotation, ImageAnnotation, TextAnnotation } from '../../types/Score'
import React from 'react'

export function textAnnotationFromRange(answerTextNode: Element, range: Range) {
  if (selectionHasNothingToUnderline(range)) {
    return undefined
  }
  const answerNodes = allNodesUnder(answerTextNode)
  const charactersBefore = charactersBeforeContainer(range.startContainer, range.startOffset, answerTextNode)
  const charactersUntilEnd = charactersBeforeContainer(range.endContainer, range.endOffset, answerTextNode)
  const length = charactersUntilEnd - charactersBefore
  // selectionHasNothingToUnderline won't catch cases where empty selection is between images
  if (length <= 0) {
    return undefined
  }
  return {
    startIndex: charactersBefore,
    length
  }

  function charactersBeforeContainer(rangeContainer: Node, offset: number, answerTextNode: Element) {
    const containerIsTag = rangeContainer === answerTextNode
    const container = containerIsTag ? rangeContainer.childNodes[offset] : rangeContainer
    const offsetInside: number = containerIsTag ? 0 : offset
    const nodesBeforeContainer = _.takeWhile(answerNodes, node => node !== container)
    return offsetInside + _.sum(nodesBeforeContainer.map(toNodeLength))
  }
}

export function getOverlappingMessages(currentAnnotations: Annotation[], start: number, length: number) {
  const textAnnotations: TextAnnotation[] = currentAnnotations.filter(a => a.type === 'text') as TextAnnotation[]
  return getOverlappingMessagesFromTextAnnotations(textAnnotations, start, length)
}
export function getOverlappingMessagesFromTextAnnotations(
  currentAnnotations: TextAnnotation[],
  start: number,
  length: number
) {
  const parted = getOverlappingAnnotations(currentAnnotations, { startIndex: start, length, message: '' })
  return _.compact(parted.overlapping.map(anno => anno.message)).reduceRight((msg, str) => `${str} / ${msg}`, '')
}
export function toNodeLength(node: Node) {
  return node.nodeType === Node.TEXT_NODE ? node.textContent?.length : node.nodeName === 'IMG' ? 1 : 0
}

export function allNodesUnder(el: Node, documentObject = document): Node[] {
  let n: Node | null = null
  const a: Node[] = []
  const walk = documentObject.createTreeWalker(el, NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT, null)
  while ((n = walk.nextNode())) {
    a.push(n)
  }
  return a
}

export function showAndPositionElement(
  annotationRect: DOMRect,
  container: HTMLElement,
  popup: HTMLElement,
  topMargin: number
) {
  const style = popup.style
  if (container) {
    style.display = 'block'
    const containerRect = container.getBoundingClientRect()
    const popupRect = popup.getBoundingClientRect()
    console.log('annotationRect', annotationRect, 'containerRect', containerRect, 'popupRect', popupRect)
    const left = annotationRect.left - containerRect.left
    const top = annotationRect.bottom - containerRect.top + topMargin

    style.top = `${String(top)}px`
    style.left = `${String(
      left + popupRect.width < containerRect.width - 30 ? left + 20 : containerRect.width - popupRect.width - 20
    )}px`
  }
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
    return (
      sel.rangeCount > 0 &&
      startContainer.parentElement?.closest('.e-grading-answer') !== null &&
      endContainer.parentElement?.closest('.e-grading-answer') !== null &&
      startContainer.parentElement?.closest('.remove-annotation-popup') === null
    )
  }

  function isRangeSelection(sel: Selection) {
    return sel?.type === 'Range'
  }

  function textSelectedInRange(sel: Selection) {
    const range = sel.getRangeAt(0)
    return (
      !!sel.rangeCount &&
      (range.toString().length > 0 ||
        isParentContainer(range.startContainer as Element) ||
        isParentContainer(range.endContainer as Element))
    )
  }

  function isParentContainer(container: Element) {
    return container.classList.contains('answer')
  }
}

export function selectionHasNothingToUnderline(range: Range) {
  const contents = range.cloneContents()
  const hasImages = Array.from(contents.childNodes).some(
    x => x instanceof Element && (x.classList.contains('e-annotation-wrapper') || x.tagName === 'IMG')
  )
  return contents.textContent?.length === 0 && !hasImages
}

export function mergeAnnotation($answerText: Element, newAnnotation: TextAnnotation, annotations: TextAnnotation[]) {
  const parted = getOverlappingAnnotations(annotations, newAnnotation)

  if (parted.overlapping.length > 0) {
    parted.overlapping.push(newAnnotation)
    const mergedStart = _.minBy(parted.overlapping, range => range.startIndex)
    const mergedEnd = _.maxBy(parted.overlapping, range => range.startIndex + range.length)
    const mergedRange = {
      startIndex: mergedStart!.startIndex,
      length: mergedEnd!.startIndex + mergedEnd!.length - mergedStart!.startIndex,
      message: newAnnotation.message
    }
    parted.nonOverlapping.push(mergedRange)
  } else {
    parted.nonOverlapping.push(newAnnotation)
  }
  return _.sortBy(
    parted.nonOverlapping,
    a =>
      a.type === 'line' || a.type === 'rect'
        ? getImageStartIndex(findAttachment($answerText, a.attachmentIndex), $answerText)
        : a.startIndex,
    a => (a.type === 'rect' ? a.y : a.type === 'line' ? a.y1 : undefined),
    a => (a.type === 'rect' ? a.x : a.type === 'line' ? a.x1 : undefined)
  )
}

function findAttachment(container: Element, index: number) {
  return container.querySelectorAll('img').item(index)
}
function getOverlappingAnnotations(
  annotations: TextAnnotation[],
  newAnnotation: TextAnnotation
): { overlapping: TextAnnotation[]; nonOverlapping: Annotation[] } {
  const partitioned = _.partition(annotations, other => {
    const newEnd = newAnnotation.startIndex + newAnnotation.length
    const otherEnd = other.startIndex + other.length
    return (
      (newAnnotation.startIndex >= other.startIndex && newAnnotation.startIndex <= otherEnd) ||
      (newEnd >= other.startIndex && newEnd <= otherEnd) ||
      (newAnnotation.startIndex <= other.startIndex && newEnd >= otherEnd)
    )
  })
  return { overlapping: partitioned[0], nonOverlapping: partitioned[1] }
}

export function getImageStartIndex($image: Element, $answerText: Element) {
  const range = document.createRange()
  range.selectNode($image)
  return textAnnotationFromRange($answerText, range)?.startIndex
}

export type NewImageAnnotation = {
  bbox: DOMRect
  attachmentIndex: number
  startX: number
  startY: number
  clientX: number
  clientY: number
}
export function annotationFromMousePosition(
  e: MouseEvent,
  { bbox, attachmentIndex, startX, startY, clientX, clientY }: NewImageAnnotation
): ImageAnnotation {
  const lineThresholdPx = 10
  const currentX = clamp((e.clientX - bbox.left) / bbox.width)
  const currentY = clamp((e.clientY - bbox.top) / bbox.height)
  const isVerticalLine = Math.abs(clientX - e.clientX) <= lineThresholdPx
  const isHorizontalLine = Math.abs(clientY - e.clientY) <= lineThresholdPx
  const type = isVerticalLine || isHorizontalLine ? 'line' : 'rect'
  switch (type) {
    case 'rect':
      return {
        type: 'rect',
        attachmentIndex,
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY),
        message: ''
      }

    case 'line':
      return {
        type: 'line',
        attachmentIndex,
        x1: isVerticalLine ? startX : Math.min(startX, currentX),
        y1: isHorizontalLine ? startY : Math.min(startY, currentY),
        x2: isVerticalLine ? startX : Math.max(startX, currentX),
        y2: isHorizontalLine ? startY : Math.max(startY, currentY),
        message: ''
      }
  }
}
export function imageAnnotationMouseDownInfo(
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  image: HTMLImageElement
): NewImageAnnotation {
  const targetAnswerText = image.closest('.e-grading-answer')!
  const attachmentIndex = Array.from(targetAnswerText.querySelectorAll('img')).findIndex(img => img === image)
  const attachmentWrapper = targetAnswerText.querySelectorAll('.e-annotation-wrapper').item(attachmentIndex)
  const bbox = attachmentWrapper.getBoundingClientRect()
  const clientX = e.clientX
  const startX = clamp((clientX - bbox.left) / bbox.width)
  const clientY = e.clientY
  const startY = clamp((clientY - bbox.top) / bbox.height)
  return { attachmentIndex, bbox, startX, startY, clientX, clientY }
}

function clamp(n: number) {
  return _.clamp(n, 0, 1)
}

export function preventDefaults(e: Event) {
  e.preventDefault()
  e.stopPropagation()
}

export function toggle(element: HTMLElement, isVisible: boolean): void {
  element.style.display = isVisible ? 'initial' : 'none'
}

export function isDesktopVersion() {
  return matchMedia('(pointer:fine)').matches
}
