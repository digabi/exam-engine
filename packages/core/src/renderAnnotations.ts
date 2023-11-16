import { Annotation, ImageAnnotation, LineAnnotation, RectAnnotation, TextAnnotation } from './types/Score'
import { createElement } from './dom-utils'
import classNames from 'classnames'

const messageLengthThreshold = 5

export function renderAnnotations(
  element: HTMLElement,
  pregradingAnnotations: Annotation[],
  censoringAnnotations: Annotation[],
  showTitle = true
): void {
  const annotations = [...pregradingAnnotations, ...censoringAnnotations]
  const annotationsWithLength = annotations.filter(a => ('length' in a ? a.length : true))

  for (const [i, annotation] of annotations.entries()) {
    const type = pregradingAnnotations.includes(annotation) ? 'pregrading' : 'censoring'
    const index = annotationsWithLength.indexOf(annotation) + 1 || undefined
    const listIndex = type === 'pregrading' ? i : i - pregradingAnnotations.length
    switch (annotation.type) {
      case 'line':
      case 'rect':
        renderImageAnnotation(element, annotation, type, listIndex, index, showTitle)
        break
      default:
        renderTextAnnotation(element, annotation, type, listIndex, index, showTitle)
    }
  }
}

export function updateImageAnnotationMarkSize(mark: HTMLElement, annotation: LineAnnotation | RectAnnotation): void {
  const style = mark.style
  const pct = (n: number) => `${n * 100}%`
  if (annotation.type === 'rect') {
    style.left = pct(annotation.x)
    style.top = pct(annotation.y)
    style.right = pct(1 - (annotation.x + annotation.width))
    style.bottom = pct(1 - (annotation.y + annotation.height))
  } else {
    style.left = pct(annotation.x1)
    style.top = pct(annotation.y1)
    style.right = pct(1 - annotation.x2)
    style.bottom = pct(1 - annotation.y2)
  }
}

function getWrapper(image: HTMLImageElement) {
  const parent = image.parentElement!

  if (parent instanceof HTMLSpanElement) {
    return parent
  }

  const wrapper = createElement('span', { className: 'e-annotation-wrapper' })
  parent.insertBefore(wrapper, image)
  wrapper.appendChild(image)

  return wrapper
}

export function wrapAllImages(answerElement: HTMLElement) {
  answerElement.querySelectorAll('img').forEach(getWrapper)
}

export function renderImageAnnotation(
  answerElement: HTMLElement,
  annotation: ImageAnnotation,
  type: 'pregrading' | 'censoring',
  listIndex: number,
  index: number | undefined,
  showTitle: boolean
): HTMLElement {
  const { attachmentIndex } = annotation
  const image = answerElement.querySelectorAll('img')[attachmentIndex]
  const title = showTitle ? annotation.message : ''
  return renderImageAnnotationByImage(image, title, annotation, type, listIndex, index)
}
export function renderImageAnnotationByImage(
  image: HTMLImageElement,
  title: string,
  annotation: ImageAnnotation,
  type: 'pregrading' | 'censoring',
  listIndex: number,
  index?: number
): HTMLElement {
  const wrapper = getWrapper(image)
  const shape = mkShape()
  wrapper.appendChild(shape)

  function mkShape() {
    const mark = createElement('mark', {
      ...{
        className: classNames('e-annotation e-annotation--shape', {
          'e-annotation--pregrading': type === 'pregrading',
          'e-annotation--censoring': type === 'censoring'
        }),
        title,
        'data-list-index': String(listIndex),
        'data-type': type
      },
      ...(index && { 'data-index': String(index) }),
      ...(annotation.message && { 'data-message': annotation.message })
    })

    updateImageAnnotationMarkSize(mark, annotation)

    if (index) {
      mark.appendChild(createSup(index, 'shape', annotation.message))
    }

    return mark
  }
  return shape
}

function renderTextAnnotation(
  rootElement: HTMLElement,
  annotation: TextAnnotation,
  type: 'pregrading' | 'censoring',
  listIndex: number,
  index: number | undefined,
  showTitle: boolean
): void {
  const { startIndex, length: annotationLength } = annotation
  return go(rootElement.childNodes[0], 0, annotationLength)

  function go(
    /* The current node in the answer HTML. */
    node: ChildNode,
    /** The current index corresponding to the node. */
    currentIndex: number,
    /* The remaining number of characters from the annotation to render. */
    remaining: number
  ): void {
    if (!isMark(node) && !isSup(node) && !isBr(node) && currentIndex >= startIndex) {
      // We found the correct spot to start an annotation. So let's create a mark element.
      const mark = mkMark()
      // Insert it before the node.
      node.parentElement?.insertBefore(mark, node)
      // Move the node and its next siblings inside the mark until the mark
      // contains the required amount of content or we run out of sibling nodes.
      // If the node is a Text node and it is too long for the annotation, we
      // split it in two and move the first part inside the mark, leaving the
      // rest in place.
      const stillRemaining = move(mark, node, remaining)

      // If we have run out of sibling nodes but still have characters to mark,
      // create another mark at the next text node. This means that marks have
      // been nested.
      if (stillRemaining > 0) {
        go(nextSibling(mark), currentIndex + annotationLength - stillRemaining, stillRemaining)
      }
      // We know that we're at the last mark of this annotation.
      // Render the superscript index after it, if necessary.
      else if (index) {
        mark.appendChild(createSup(index, 'text', annotation.message))
      }
    } else {
      if (node instanceof Text && currentIndex + length(node) > startIndex) {
        // The annotation should start in the middle of this text node. We need to split it in two.
        node.splitText(startIndex - currentIndex)
      }

      go(next(node), currentIndex + length(node), remaining)
    }
  }

  function isBr(node: ChildNode): node is HTMLBRElement {
    return node.nodeName === 'BR'
  }

  function isMark(node: ChildNode): node is HTMLElement {
    return node.nodeName === 'MARK'
  }

  function isSup(node: ChildNode): node is HTMLElement {
    return node.nodeName === 'SUP'
  }

  function isImage(node: ChildNode): node is HTMLImageElement | HTMLSpanElement {
    // If we've already added an image annotation to the image, it will be wrapped
    // in a <span> element.
    return node.nodeName === 'IMG' || node.nodeName === 'SPAN'
  }

  function next(node: ChildNode): ChildNode {
    return isMark(node) ? node.childNodes[0] : nextSibling(node)
  }

  function nextSibling(node: ChildNode): ChildNode {
    const sibling = node.nextSibling

    if (sibling) {
      return sibling
    }

    const parent = node.parentElement

    // If we encounter the root element, we've run out of text to annotate. This
    // could be a bug in the annotation code or perhaps the annotations are invalid.
    // To err on the side of caution, throw an exception in this case.
    if (parent === null || parent === rootElement) {
      throw new Error('Bug: the answer seems to be too short for the current set of annotations.')
    }

    return nextSibling(parent)
  }

  function length(node: ChildNode): number {
    return node instanceof Text ? node.length : isImage(node) ? 1 : 0
  }

  function mkMark(): HTMLElement {
    return createElement('mark', {
      ...{
        className: classNames('e-annotation', {
          'e-annotation--pregrading': type === 'pregrading',
          'e-annotation--censoring': type === 'censoring'
        }),
        title: showTitle ? annotation.message : '',
        'data-list-index': String(listIndex),
        'data-type': type
      },
      ...(index && { 'data-index': String(index) }),
      ...(annotation.message && { 'data-message': annotation.message })
    })
  }

  function move(mark: HTMLElement, node: ChildNode | null, remaining: number): number {
    if (!node || isMark(node) || remaining === 0) {
      return remaining
    }

    // Split text nodes if they are too long.
    if (node instanceof Text && length(node) > 0 && length(node) > remaining) {
      node.splitText(remaining)
    }

    const nextSibling = node.nextSibling
    mark.appendChild(node)
    return move(mark, nextSibling, remaining - length(node))
  }
}

function createSup(index: number, type: 'text' | 'shape', message: string) {
  return createElement('sup', {
    className: `e-annotation__index e-annotation__index--${type}`,
    'data-content': message.length > messageLengthThreshold ? `${index})` : message,
    'data-message': message
  })
}
