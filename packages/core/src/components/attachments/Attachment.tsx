import React, { useContext } from 'react'
import { AttachmentContext, withAttachmentContext } from '../context/AttachmentContext'
import { ExamComponentProps } from '../../createRenderChildNodes'

function Attachment({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber, isExternal } = useContext(AttachmentContext)

  return isExternal ? (
    <div id={displayNumber} className="attachments-attachment e-mrg-0 e-mrg-t-8" data-annotation-anchor={displayNumber}>
      {renderChildNodes(element)}
    </div>
  ) : null
}

export default React.memo(withAttachmentContext(Attachment))
