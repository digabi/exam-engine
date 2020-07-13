import React, { useContext } from 'react'
import { AttachmentContext, withAttachmentContext } from './AttachmentContext'
import { ExamComponentProps } from '../createRenderChildNodes'

function ExamAttachment({ element, renderChildNodes }: ExamComponentProps) {
  const { isExternal } = useContext(AttachmentContext)
  return !isExternal ? <span className="exam-attachment e-mrg-b-2">{renderChildNodes(element)}</span> : null
}

export default React.memo(withAttachmentContext(ExamAttachment))
