import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { query } from '../dom-utils'
import { url } from '../url'
import AttachmentLinkAnchor from './AttachmentLinkAnchor'
import { CommonExamContext } from './CommonExamContext'
import { ExamComponentProps } from './types'

function AttachmentLink({ element }: ExamComponentProps) {
  const name = element.getAttribute('ref')!
  const { root } = useContext(CommonExamContext)
  const { attachmentsURL } = useContext(CommonExamContext)
  const attachment = query(root, el => el.localName === 'attachment' && el.getAttribute('name') === name)!
  const displayNumber = attachment.getAttribute('display-number')!
  const isShort = element.getAttribute('type') === 'short'
  const href = url(attachmentsURL, { hash: displayNumber })

  return isShort ? (
    <AttachmentLinkAnchor href={href}>{displayNumber}</AttachmentLinkAnchor>
  ) : (
    <>
      {'('}
      <AttachmentLinkAnchor href={href}>
        <Translation>{t => t('material').toLowerCase()}</Translation> {displayNumber}
      </AttachmentLinkAnchor>
      {')'}
    </>
  )
}

export default React.memo(AttachmentLink)
