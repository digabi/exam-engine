import React, { useContext } from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'
import { query } from '../dom-utils'
import { useExamTranslation } from '../i18n'
import { url } from '../url'
import AttachmentLinkAnchor from './AttachmentLinkAnchor'
import { CommonExamContext } from './CommonExamContext'

const mkAttachmentLink = (type: 'link' | 'plain'): React.FunctionComponent<ExamComponentProps> => {
  const AttachmentLink: React.FunctionComponent<ExamComponentProps> = ({ element }) => {
    const name = element.getAttribute('ref')!
    const { root } = useContext(CommonExamContext)
    const { attachmentsURL } = useContext(CommonExamContext)
    const { t } = useExamTranslation()
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
          {t('material', { postProcess: 'lowercase' })} {displayNumber}
        </AttachmentLinkAnchor>
        {')'}
      </>
    )
  }

  return React.memo(AttachmentLink)
}

export default mkAttachmentLink
