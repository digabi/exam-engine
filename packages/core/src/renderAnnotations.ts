import { Annotation, ImageAnnotation, TextAnnotation } from './types/Score'

// TODO: Lots of manual DOM manipulation here. Maybe we should have a few helper functions to make it easier?
// I'm thinking at least some kind of `createElement(tagName, attrs, ...children)` function might be worth it.

export function renderAnnotations(element: HTMLElement, annotations: Annotation[], backgroundColor: string): void {
  for (const annotation of annotations) {
    switch (annotation.type) {
      case 'line':
      case 'rect':
        renderImageAnnotation(element, annotation, backgroundColor)
        break
      default:
        renderTextAnnotation(element, annotation, backgroundColor)
    }
  }
}

function renderImageAnnotation(element: HTMLElement, annotation: ImageAnnotation, backgroundColor: string): void {
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

    const wrapper = document.createElement('span')
    wrapper.style.cssText = 'display: inline-block; position: relative; max-width: 100%;'

    parent.insertBefore(wrapper, image)
    wrapper.appendChild(image)

    return wrapper
  }

  function mkShape() {
    const shape = document.createElement('span')
    shape.title = annotation.message

    const style = shape.style
    style.cssText = `position: absolute; min-width: 4px; min-height: 4px;`
    style.backgroundColor = backgroundColor

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

    return shape
  }
}

function renderTextAnnotation(element: HTMLElement, annotation: TextAnnotation, backgroundColor: string): void {
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
    const mark = document.createElement('mark')
    mark.title = annotation.message
    mark.style.backgroundColor = backgroundColor
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
