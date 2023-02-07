import React, { useLayoutEffect, useRef } from 'react'
import { Score } from '../..'
import { renderAnnotations } from '../../renderAnnotations'
import * as _ from 'lodash-es'

export const GradingAnswer: React.FunctionComponent<{
  type: 'richText' | 'text'
  value?: string
  score?: Score
}> = ({ type, score, value }) => {
  const answerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (answerRef.current) {
      renderAnnotations(answerRef.current, score?.pregrading?.annotations ?? [], score?.censoring?.annotations ?? [])
      document.addEventListener('selectionchange', onSelect)
    }
  })

  function onSelect() {
    const selection = window.getSelection()
    if (selection && answerRef.current !== null && popupRef.current !== null) {
      const range = selection.getRangeAt(0)
      console.log(range, '\n=== range')
      const position = calculatePosition(answerRef.current, range)
      console.log(position, '\n=== position')
      const { left, top } = getPopupCss(range, answerRef.current)
      popupRef.current.style.left = `${String(left)}px`
      popupRef.current.style.top = `${String(top)}px`
    }
  }
  return type === 'richText' ? (
    <div
      style={{ position: 'relative' }}
      className="e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1"
    >
      <div dangerouslySetInnerHTML={{ __html: value || '' }} ref={answerRef} />
      <div className="popup" style={{ position: 'absolute' }} ref={popupRef}>
        POPUP
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
