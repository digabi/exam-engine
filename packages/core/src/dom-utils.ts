import * as _ from 'lodash-es'
import { ExamNamespaceURI } from './createRenderChildNodes'
import { useContext, useEffect, useState } from 'react'
import { TOCContext } from './components/context/TOCContext'
import { ExamAnswer, QuestionId } from './types/ExamAnswer'
import { ItemsState } from './components/exam/DNDAnswerContainer'
import { UniqueIdentifier } from '@dnd-kit/core'

export const NBSP = '\u00A0'

export function parentElements(element: Element, selector?: Selector): Element[] {
  const predicate = selector != null ? mkPredicate(selector) : undefined
  const result = []
  while (element.parentElement != null) {
    element = element.parentElement
    if (predicate == null || predicate(element)) {
      result.push(element)
    }
  }
  return result
}

type Selector = string | string[] | ((element: Element) => boolean)

function mkPredicate(selector: Selector): (element: Element) => boolean {
  return typeof selector === 'function'
    ? (element: Element) => element.namespaceURI === ExamNamespaceURI && selector(element)
    : Array.isArray(selector)
      ? (element: Element) => element.namespaceURI === ExamNamespaceURI && selector.includes(element.localName)
      : (element: Element) => element.namespaceURI === ExamNamespaceURI && element.localName === selector
}

export function query(root: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(selector)

  function go(element: Element): Element | undefined {
    for (let i = 0, length = element.children.length; i < length; i++) {
      const childElement = element.children[i]
      if (predicate(childElement)) {
        return childElement
      }
      const maybeElement = go(childElement)
      if (maybeElement != null) {
        return maybeElement
      }
    }
  }

  return go(root)
}

export function queryAll(root: Element, selector: Selector, recurse = true): Element[] {
  const predicate = mkPredicate(selector)
  const results: Element[] = []

  function go(element: Element) {
    for (let i = 0, length = element.children.length; i < length; i++) {
      const childElement = element.children[i]
      if (predicate(childElement)) {
        results.push(childElement)
        if (recurse) {
          go(childElement)
        }
      } else {
        go(childElement)
      }
    }
  }

  go(root)
  return results
}

export function queryAncestors(element: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(selector)
  while (element.parentElement != null) {
    element = element.parentElement
    if (predicate(element)) {
      return element
    }
  }
}

export function findChildElement(element: Element, selector: Selector): Element | undefined {
  const predicate = mkPredicate(selector)

  for (let i = 0, length = element.children.length; i < length; i++) {
    const childElement = element.children[i]
    if (predicate(childElement)) {
      return childElement
    }
  }
}
export function getAttribute(element: Element, attributeName: string): string | undefined {
  return element.getAttribute(attributeName) ?? undefined
}

export function getNumericAttribute(element: Element, attributeName: string): number | undefined {
  const maybeValue = element.getAttribute(attributeName)
  return maybeValue != null ? Number(maybeValue) : undefined
}

export function getBooleanAttribute(element: Element, attributeName: string): boolean {
  return getAttribute(element, attributeName) === 'true'
}

export function mapChildNodes<T>(element: Element, fn: (childNode: ChildNode, index: number) => T): T[] {
  const length = element.childNodes.length
  const result = new Array<T>(length)
  for (let i = 0; i < length; i++) {
    result[i] = fn(element.childNodes[i], i)
  }
  return result
}

export function mapChildElements<T>(element: Element, fn: (childElement: Element, index: number) => T): T[] {
  const result = []
  for (let i = 0, length = element.children.length; i < length; i++) {
    const childElement = element.children[i]
    result.push(fn(childElement, i))
  }
  return result
}

export function findChildrenAnswers(element: Element): Element[] {
  return queryAll(
    element,
    ['choice-answer', 'dropdown-answer', 'text-answer', 'scored-text-answer', 'dnd-answer', 'audio-answer'],
    true
  )
}

export function hasSiblingQuestions(answer: Element) {
  const parentQuestion = queryAncestors(answer, 'question')
  const siblingQuestions = parentQuestion?.querySelectorAll('[question-id]')
  return siblingQuestions && siblingQuestions?.length > 1
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  properties?: Record<string, string> | null,
  ...children: Array<string | ChildNode>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  setProperties(element, properties)
  children.forEach(c => element.appendChild(typeof c === 'string' ? new Text(c) : c))
  return element
}

export function setProperties(element: HTMLElement, properties?: Record<string, string> | null): void {
  _.forEach(properties, (v, k) => {
    if (k === 'css') {
      element.style.cssText = v
    } else if (k.startsWith('data-')) {
      element.setAttribute(k, v)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ;(element as any)[k] = v
    }
  })
}

export function useIsElementInViewport(elementType: 'question' | 'section', displayNumber: string) {
  const { visibleTOCElements } = useContext(TOCContext)
  const [isVisible, setIsVisible] = useState(false)

  const id = `${elementType}-${displayNumber}`

  useEffect(() => {
    if (visibleTOCElements?.includes(id) && !isVisible) {
      setIsVisible(true)
    } else if (!visibleTOCElements?.includes(id) && isVisible) {
      setIsVisible(false)
    }
  }, [visibleTOCElements])

  return isVisible
}

export function getElementPath(element: Element): string {
  const index = !element.tagName && Array.from(element.parentNode?.childNodes || []).indexOf(element)
  const elementIndex = Array.from(element.parentElement?.children || []).indexOf(element)
  let path = `${element.nodeName}:${elementIndex > 0 ? elementIndex : index}`
  let currentElement = element
  while (currentElement.parentElement) {
    currentElement = currentElement.parentElement
    const displayNumber = currentElement.getAttribute('display-number')
    const isNumber = Number(displayNumber)
    const index = isNumber
      ? displayNumber
      : Array.from(currentElement.parentElement?.children || [currentElement]).indexOf(currentElement)
    const elementId = currentElement.getAttribute('id')
    path = `${elementId || currentElement.nodeName}:${index} > ${path}`
  }

  return path
}

// For DND answers

export const getAnswerOptionIdsByQuestionId = (element: Element, answersById: Record<QuestionId, ExamAnswer>) => {
  const dndAnswers = queryAll(element, 'dnd-answer')
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

  const answerOptionIdsByQuestionId: ItemsState = dndAnswers.reduce(
    (acc, group) => {
      const questionId = group.getAttribute('question-id')!
      const answer = answersById[Number(questionId)]?.value
      return {
        ...acc,
        [questionId]: answer ? [Number(answer)] : [],
        root: acc.root.filter(e => e !== Number(answer))
      }
    },
    { root: dndAnswerOptions.map(e => Number(e.getAttribute('option-id')!)) }
  )
  return answerOptionIdsByQuestionId
}

export const getAnswerOptionsByOptionId = (element: Element) => {
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')
  const answerOptionsByOptionId: Record<UniqueIdentifier, Element> = dndAnswerOptions.reduce((acc, el) => {
    const optionId = el.getAttribute('option-id')!
    return { ...acc, [optionId]: el }
  }, {})
  return answerOptionsByOptionId
}

export const getCorrectAnswerOptionIdsByQuestionId = (element: Element) => {
  const correctAnswerOptionsByQuestionId = queryAll(element, 'dnd-answer-option').reduce(
    (acc: Omit<ItemsState, 'root'>, el) => {
      const questionId = el.getAttribute('for-question-id')!
      const optionId = el.getAttribute('option-id')!
      if (!questionId) {
        return acc
      }
      const current = acc[questionId] || []
      return { ...acc, [questionId]: current.concat(optionId) }
    },
    {}
  )
  return correctAnswerOptionsByQuestionId
}
