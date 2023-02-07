import React, { useLayoutEffect, useRef } from 'react'
import { Annotation } from '../..'
import { renderAnnotations } from '../../renderAnnotations'
import * as _ from 'lodash-es'

export const GradingAnswer: React.FunctionComponent<{
  type: 'richText' | 'text'
  value?: string
  pregrading?: Annotation[]
  censoring?: Annotation[]
  setPregrading: (annotations: Annotation[]) => void
  setCensoring: (annotations: Annotation[]) => void
  // @ts-ignore
}> = ({ type, pregrading, censoring, setPregrading, setCensoring, value }) => {
  const answerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (answerRef.current) {
      renderAnnotations(answerRef.current, pregrading ?? [], censoring ?? [])
      document.addEventListener('selectionchange', onSelect)
      document.addEventListener('mousedown', () => console.log('mousedown'))
      document.addEventListener('mouseup', onMouseUp)
    }
  })

  function onSelect() {}
  function onMouseUp() {
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && popupRef.current !== null && hasTextSelectedInAnswerText()) {
      const range = selection.getRangeAt(0)
      const position = calculatePosition(answerRef.current, range)
      console.log(range, position, '\n=== range')
      setPregrading([{ ...position, type: 'text', message: '' }])
      // setCensoring(censoring)
      const { left, top } = getPopupCss(range, answerRef.current)
      popupRef.current.style.left = `${String(left)}px`
      popupRef.current.style.top = `${String(top)}px`
    }
  }
  function onChange(value: string) {
    console.log(value)
  }
  return type === 'richText' ? (
    <div
      style={{ position: 'relative' }}
      className="e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
    >
      <div dangerouslySetInnerHTML={{ __html: value || '' }} ref={answerRef} />
      <div className="popup" style={{ position: 'absolute' }} ref={popupRef}>
        <div className="popup add-annotation-popup">
          <input onChange={(e) => onChange(e.target.value)} className="add-annotation-text" type="text" value="" />
          <i className="fa fa-comment"></i>
          <button data-i18n="arpa.annotate">Merkitse</button>
        </div>
      </div>
    </div>
  ) : (
    <span className="text-answer text-answer--single-line">
      <span className="e-inline-block" ref={answerRef}>
        {value}
      </span>
    </span>
  )
}

export function calculatePosition(answerTextNode: HTMLDivElement, range: Range) {
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

function getPopupCss(range: Range, container: HTMLDivElement) {
  const boundingRect = range.getBoundingClientRect()
  if (container) {
    const containerRect = container.getBoundingClientRect()
    return {
      top: boundingRect.bottom - containerRect.top + 10,
      left: boundingRect.left - containerRect.left,
    }
  } else {
    return {
      top: 0,
      left: 0,
    }
  }
}

function hasTextSelectedInAnswerText(): boolean {
  const selection = window.getSelection()
  return (
    selection !== null &&
    selectionInAnswerText(selection) &&
    (isRangeSelection(selection) || textSelectedInRange(selection))
  )

  function selectionInAnswerText(sel: Selection) {
    if (sel.type === 'None' || sel.type === 'Caret' || sel.rangeCount === 0) return false
    const startContainer = sel.getRangeAt(0).startContainer
    console.log(startContainer, '\n=== startContainer')
    return (
      sel.rangeCount > 0 &&
      startContainer.parentElement?.closest('.e-multiline-results-text-answer') !== null &&
      startContainer.parentElement?.closest('.remove-annotation-popup') === null
    )
  }

  function isRangeSelection(sel: Selection) {
    return _.get(sel, 'type', '') === 'Range'
  }

  function textSelectedInRange(sel: Selection) {
    const range = sel.getRangeAt(0)
    return (
      _.get(sel, 'rangeCount', 0) > 0 &&
      (range.toString().length > 0 ||
        isParentContainer(range.startContainer as Element) ||
        isParentContainer(range.endContainer as Element))
    )
  }

  function isParentContainer(container: Element) {
    return container && container.classList && container.classList.contains('answerText')
  }
}
