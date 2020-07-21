import React, { useContext } from 'react'
import { AttachmentContext, withAttachmentContext } from './AttachmentContext'
import { ExamComponentProps } from '../createRenderChildNodes'
import { attachmentTitleId } from './ids'

function AttachmentsAttachment({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, isExternal } = useContext(AttachmentContext)

  return isExternal ? (
    <section
      id={displayNumber!}
      className="attachments-attachment e-mrg-0 e-mrg-t-8"
      aria-labelledby={attachmentTitleId(displayNumber!)}
    >
      {renderChildNodes(element)}
    </section>
  ) : null
}

export default React.memo(withAttachmentContext(AttachmentsAttachment))
