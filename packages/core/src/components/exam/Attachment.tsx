import React, { useContext } from 'react'
import { AttachmentContext, withAttachmentContext } from '../context/AttachmentContext'
import { ExamComponentProps } from '../../createRenderChildNodes'

function Attachment({ element, renderChildNodes }: ExamComponentProps) {
  const { isExternal } = useContext(AttachmentContext)
  return !isExternal ? <span className="exam-attachment e-mrg-b-2">{renderChildNodes(element)}</span> : null
}

export default React.memo(withAttachmentContext(Attachment))
