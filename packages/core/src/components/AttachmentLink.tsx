import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { query } from '../dom-utils'
import { url } from '../url'
import AttachmentLinkAnchor from './AttachmentLinkAnchor'
import { CommonExamContext } from './CommonExamContext'
import { ExamComponentProps } from '../createRenderChildNodes'

const mkAttachmentLink = (type: 'link' | 'plain'): React.FunctionComponent<ExamComponentProps> => {
  const AttachmentLink: React.FunctionComponent<ExamComponentProps> = ({ element }) => {
    const name = element.getAttribute('ref')!
    const { root } = useContext(CommonExamContext)
    const { attachmentsURL } = useContext(CommonExamContext)
    const attachment = query(root, (el) => el.localName === 'attachment' && el.getAttribute('name') === name)!
    const displayNumber = attachment.getAttribute('display-number')!
    const isShort = element.getAttribute('type') === 'short'
    const href = url(attachmentsURL, { hash: displayNumber })

    return isShort ? (
      <AttachmentLinkAnchor {...{ href, type }}>{displayNumber}</AttachmentLinkAnchor>
    ) : (
      <>
        {'('}
        <AttachmentLinkAnchor {...{ href, type }}>
          <Translation>{(t) => t('material').toLowerCase()}</Translation> {displayNumber}
        </AttachmentLinkAnchor>
        {')'}
      </>
    )
  }

  return React.memo(AttachmentLink)
}

export default mkAttachmentLink
