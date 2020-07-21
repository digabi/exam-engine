import React, { useContext } from 'react'
import { NBSP } from '../dom-utils'
import { AttachmentContext } from './AttachmentContext'
import { ExamComponentProps } from '../createRenderChildNodes'
import { attachmentTitleId } from './ids'

function AttachmentsAttachmentTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(AttachmentContext)

  return (
    <h3 id={attachmentTitleId(displayNumber!)}>
      {displayNumber}
      {NBSP}
      {renderChildNodes(element)}
    </h3>
  )
}

export default React.memo(AttachmentsAttachmentTitle)
