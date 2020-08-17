import { Annotation, ImageAnnotation, TextAnnotation } from './types/Score'
import { createElement } from './dom-utils'
import classNames from 'classnames'

export function renderAnnotations(
  element: HTMLElement,
  pregradingAnnotations: Annotation[],
  censoringAnnotations: Annotation[]
): void {
  const annotations = [...pregradingAnnotations, ...censoringAnnotations]
  const annotationsWithMessages = annotations.filter((a) => a.message)

  for (const annotation of annotations) {
    const type = pregradingAnnotations.includes(annotation) ? 'pregrading' : 'censoring'
    const index = annotationsWithMessages.indexOf(annotation) + 1 || undefined

    switch (annotation.type) {
      case 'line':
      case 'rect':
        renderImageAnnotation(element, annotation, type, index)
        break
      default:
        renderTextAnnotation(element, annotation, type, index)
    }
  }
}

function renderImageAnnotation(
  element: HTMLElement,
  annotation: ImageAnnotation,
  type: 'pregrading' | 'censoring',
  index?: number
): void {
  const { attachmentIndex } = annotation
  const image = element.querySelectorAll('img')[attachmentIndex]

  const wrapper = getWrapper()
  const shape = mkShape()
  wrapper.appendChild(shape)

  function getWrapper() {
    const parent = image.parentElement!

    if (parent instanceof HTMLSpanElement) {
      return parent
    }

    const wrapper = createElement('span', { className: 'e-annotation-wrapper' })
    parent.insertBefore(wrapper, image)
    wrapper.appendChild(image)

    return wrapper
  }

  function mkShape() {
    const shape = createElement('mark', {
      className: classNames('e-annotation e-annotation--shape', {
        'e-annotation--pregrading': type === 'pregrading',
        'e-annotation--censoring': type === 'censoring',
      }),
      title: annotation.message,
    })

    const style = shape.style
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

    if (index) {
      shape.appendChild(createElement('sup', { className: 'e-annotation__index' }, `${index})`))
    }

    return shape
  }
}

function renderTextAnnotation(
  element: HTMLElement,
  annotation: TextAnnotation,
  type: 'pregrading' | 'censoring',
  index?: number
): void {
  const { startIndex, length: annotationLength } = annotation
  return go(element.childNodes[0], 0, annotationLength)

  function go(
    /* The current node in the answer HTML. */
    node: ChildNode,
    /** The current index corresponding to the node. */
    currentIndex: number,
    /* The remaining number of characters from the annotation to render. */
    remaining: number
  ): void {
    if (!isMark(node) && currentIndex >= startIndex) {
      // We found the correct spot to start an annotation. So let's create a mark element.
      const mark = mkMark(node)
      // How many characters are left in the annotation to mark.
      const stillRemaining = move(mark, node, remaining)

      // If we still have characters to mark, continue the process.
      if (stillRemaining > 0) {
        go(nextSibling(mark), currentIndex + annotationLength - stillRemaining, stillRemaining)
      } else if (index) {
        mark.appendChild(createElement('sup', null, `${index})`))
      }
    } else {
      if (node instanceof Text && currentIndex + length(node) > startIndex) {
        // The current text node is longer than the annotation. We need to split it in two.
        node.splitText(startIndex - currentIndex)
      }

      go(next(node), currentIndex + length(node), remaining)
    }
  }

  function isMark(node: ChildNode): node is HTMLElement {
    return node.nodeName === 'MARK'
  }

  function next(node: ChildNode): ChildNode {
    return isMark(node) ? node.childNodes[0] : nextSibling(node)
  }

  function nextSibling(node: ChildNode): ChildNode {
    return node.nextSibling || nextSibling(node.parentElement!)
  }

  function length(node: ChildNode): number {
    return node instanceof Text ? node.length : node.nodeName === 'IMG' ? 1 : 0
  }

  function mkMark(node: ChildNode): HTMLElement {
    const mark = createElement('mark', {
      className: classNames('e-annotation', {
        'e-annotation--pregrading': type === 'pregrading',
        'e-annotation--censoring': type === 'censoring',
      }),
      title: annotation.message,
    })

    node.parentElement!.insertBefore(mark, node)
    return mark
  }

  function move(mark: HTMLElement, node: ChildNode | null, remaining: number): number {
    if (node == null || isMark(node) || remaining === 0) {
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
