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
    const mark = createElement('mark', {
      className: classNames('e-annotation e-annotation--shape', {
        'e-annotation--pregrading': type === 'pregrading',
        'e-annotation--censoring': type === 'censoring',
      }),
      title: annotation.message,
    })

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

    if (index) {
      createSup(mark, index)
    }

    return mark
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
    if (!isMark(node) && !isSup(node) && currentIndex >= startIndex) {
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
        createSup(mark, index)
      }
    } else {
      if (node instanceof Text && currentIndex + length(node) > startIndex) {
        // The annotation should start in the middle of this text node. We need to split it in two.
        node.splitText(startIndex - currentIndex)
      }

      go(next(node), currentIndex + length(node), remaining)
    }
  }

  function isMark(node: ChildNode): node is HTMLElement {
    return node.nodeName === 'MARK'
  }

  function isSup(node: ChildNode): node is HTMLElement {
    return node.nodeName === 'SUP'
  }

  function isImg(node: ChildNode): node is HTMLImageElement {
    return node.nodeName === 'IMG'
  }

  function next(node: ChildNode): ChildNode {
    return isMark(node) ? node.childNodes[0] : nextSibling(node)
  }

  function nextSibling(node: ChildNode): ChildNode {
    return node.nextSibling || nextSibling(node.parentElement!)
  }

  function length(node: ChildNode): number {
    return node instanceof Text ? node.length : isImg(node) ? 1 : 0
  }

  function mkMark(): HTMLElement {
    return createElement('mark', {
      className: classNames('e-annotation', {
        'e-annotation--pregrading': type === 'pregrading',
        'e-annotation--censoring': type === 'censoring',
      }),
      title: annotation.message,
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

function createSup(parent: Element, index: number) {
  const sup = createElement('sup', { className: 'e-annotation__index' }, `${index})`)
  parent.appendChild(sup)
  const width = sup.clientWidth
  // Write the new property in a rAF to avoid n reflows.
  requestAnimationFrame(() => {
    sup.style.right = `-${width + 4}px`
  })
}
