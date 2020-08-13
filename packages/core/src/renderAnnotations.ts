import { Annotation, ImageAnnotation, TextAnnotation } from './types/Score'

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

function renderImageAnnotation(_element: HTMLElement, _annotation: ImageAnnotation, _backgroundColor: string): void {
  return
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
