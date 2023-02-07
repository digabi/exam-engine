import * as _ from 'lodash-es'
import { Annotation, TextAnnotation } from '../../types/Score'

export function calculatePosition(answerTextNode: Element, range: Range) {
  const answerNodes = allNodesUnder(answerTextNode)
  const charactersBefore = charactersBeforeContainer(range.startContainer, range.startOffset)
  const charactersUntilEnd = charactersBeforeContainer(range.endContainer, range.endOffset)
  return {
    startIndex: charactersBefore,
    length: charactersUntilEnd - charactersBefore,
  }

  function charactersBeforeContainer(rangeContainer: Node, offset: number) {
    const containerIsTag = rangeContainer === answerTextNode
    const container = containerIsTag ? rangeContainer.childNodes[offset] : rangeContainer
    const offsetInside: number = containerIsTag ? 0 : offset
    const nodesBeforeContainer = _.takeWhile(answerNodes, (node) => node !== container)
    return offsetInside + _.sum(nodesBeforeContainer.map(toNodeLength))
  }
}

export function toNodeLength(node: Node) {
  return node.nodeType === Node.TEXT_NODE ? node.textContent?.length : node.nodeName === 'IMG' ? 1 : 0
}

export function allNodesUnder(el: Node, documentObject = document): Node[] {
  let n: Node | null = null
  const a: Node[] = []
  const walk = documentObject.createTreeWalker(el, NodeFilter.SHOW_ALL, null)
  while ((n = walk.nextNode())) {
    a.push(n)
  }
  return a
}

export function getPopupCss(range: Range, container: HTMLDivElement) {
  const boundingRect = range.getBoundingClientRect()
  if (container) {
    const containerRect = container.getBoundingClientRect()
    return {
      top: String(boundingRect.bottom - containerRect.top + 10) + 'px',
      left: String(boundingRect.left - containerRect.left) + 'px',
    }
  } else {
    return {
      top: '0px',
      left: '0px',
    }
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
    if (sel.type === 'None' || sel.type === 'Caret' || sel.rangeCount === 0) return false
    const startContainer = sel.getRangeAt(0).startContainer
    return (
      sel.rangeCount > 0 &&
      startContainer.parentElement?.closest('.e-multiline-results-text-answer') !== null &&
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
    return container && container.classList && container.classList.contains('answerText')
  }
}

export function selectionHasNothingToUnderline(range: Range) {
  const contents = range.cloneContents()
  const hasImages = Array.from(contents.childNodes)
    .map((x) => (x instanceof Element ? x.tagName : null))
    .includes('IMG')
  return contents.textContent?.length === 0 && !hasImages
}

export function mergeAnnotation($answerText: Element, newAnnotation: TextAnnotation, annotations: Annotation[]) {
  // @ts-ignore
  const parted = getOverlappingAnnotations(annotations, newAnnotation)

  if (parted.overlapping.length > 0) {
    parted.overlapping.push(newAnnotation)
    const mergedStart = _.minBy(parted.overlapping, (range) => range.startIndex)
    const mergedEnd = _.maxBy(parted.overlapping, (range) => range.startIndex + range.length)
    const mergedRange = {
      startIndex: mergedStart!.startIndex,
      length: mergedEnd!.startIndex + mergedEnd!.length - mergedStart!.startIndex,
      message: newAnnotation.message,
    }
    parted.nonOverlapping.push(mergedRange)
  } else {
    parted.nonOverlapping.push(newAnnotation)
  }
  return _.sortBy(
    parted.nonOverlapping,
    (a) =>
      a.type === 'line' || a.type === 'rect'
        ? getImageStartIndex(findAttachment($answerText, a.attachmentIndex), $answerText)
        : a.startIndex,
    (a) => (a.type === 'rect' ? a.y : a.type === 'line' ? a.y1 : undefined),
    (a) => (a.type === 'rect' ? a.x : a.type === 'line' ? a.x1 : undefined)
  )
}

function findAttachment(container: Element, index: number) {
  return container.querySelectorAll('img').item(index)
}
function getOverlappingAnnotations(
  annotations: TextAnnotation[],
  newAnnotation: TextAnnotation
): { overlapping: TextAnnotation[]; nonOverlapping: Annotation[] } {
  const partitioned = _.partition(annotations, (other) => {
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
  const referenceNode = $image
  range.selectNode(referenceNode)
  return calculatePosition($answerText, range).startIndex
}
