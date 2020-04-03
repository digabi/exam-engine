import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { mapChildElements, query } from '../dom-utils'
import { url } from '../url'
import AttachmentLinkAnchor from './AttachmentLinkAnchor'
import { CommonExamContext } from './CommonExamContext'
import { ExamComponentProps } from './types'

function AttachmentLinks({ element }: ExamComponentProps) {
  const { root, attachmentsURL } = useContext(CommonExamContext)
  const displayNumbers = mapChildElements(element, attachmentLink => {
    const name = attachmentLink.getAttribute('ref')!
    const attachment = query(root, el => el.localName === 'attachment' && el.getAttribute('name') === name)!
    return attachment.getAttribute('display-number')!
  })
  const groupedDisplayNumbers = splitWhen(displayNumbers, (displayNumber, i) => {
    return i > 0 && !isSuccessive(displayNumbers[i - 1], displayNumber)
  })

  const isShort = element.getAttribute('type') === 'short'
  const href = url(attachmentsURL, { hash: displayNumbers[0] })
  const displayNumbersString = groupedDisplayNumbers
    .map(group => {
      return group.length > 1 ? `${group[0]}–${group[group.length - 1]}` : group[0]
    })
    .join(', ')

  const count = groupedDisplayNumbers[0].length
  return isShort ? (
    <AttachmentLinkAnchor href={href}>{displayNumbersString}</AttachmentLinkAnchor>
  ) : (
    <>
      {'('}
      <AttachmentLinkAnchor href={href}>
        <Translation>{t => t('material', { count }).toLowerCase()}</Translation> {displayNumbersString}
      </AttachmentLinkAnchor>
      {')'}
    </>
  )
}

function splitWhen<T>(array: T[], predicate: (t: T, index: number, array: T[]) => boolean): T[][] {
  const result: T[][] = [[]]
  let prev: T | undefined

  for (let i = 0; i < array.length; i++) {
    const elem = array[i]

    if (prev && predicate(elem, i, array)) {
      const group = [elem]
      result.push(group)
    } else {
      const lastGroup = result[result.length - 1]
      lastGroup.push(elem)
    }

    prev = elem
  }

  return result
}

function isSuccessive(a: string, b: string) {
  const length = a.length

  if (length !== b.length) {
    return false
  }
  return a.startsWith(b.slice(0, length - 1)) && b.charCodeAt(length - 1) - a.charCodeAt(length - 1) === 1
}

export default React.memo(AttachmentLinks)
