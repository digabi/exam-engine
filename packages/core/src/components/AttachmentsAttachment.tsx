import React, { useContext } from 'react'
import { AttachmentContext, withAttachmentContext } from './AttachmentContext'
import { ExamComponentProps } from '../createRenderChildNodes'

function AttachmentsAttachment({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, isExternal } = useContext(AttachmentContext)

  return isExternal ? (
    <figure id={displayNumber!} className="attachments-attachment e-mrg-0 e-mrg-t-8">
      {renderChildNodes(element)}
    </figure>
  ) : null
}

export default React.memo(withAttachmentContext(AttachmentsAttachment))
