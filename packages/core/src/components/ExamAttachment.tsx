import React, { useContext } from 'react'
import { AttachmentContext, withAttachmentContext } from './AttachmentContext'
import { ExamComponentProps } from '../createRenderChildNodes'

function ExamAttachment({ element, renderChildNodes }: ExamComponentProps) {
  const { isExternal } = useContext(AttachmentContext)
  return !isExternal ? (
    <figure className="exam-attachment e-inline e-mrg-0 e-mrg-b-2">{renderChildNodes(element)}</figure>
  ) : null
}

export default React.memo(withAttachmentContext(ExamAttachment))
