import React, { useContext } from 'react'
import { NBSP } from '../dom-utils'
import { AttachmentContext } from './AttachmentContext'
import { ExamComponentProps } from '../createRenderChildNodes'

function AttachmentsAttachmentTitle({ element, renderChildNodes }: ExamComponentProps) {
  const { displayNumber } = useContext(AttachmentContext)

  return (
    <h3>
      {displayNumber}
      {NBSP}
      {renderChildNodes(element)}
    </h3>
  )
}

export default React.memo(AttachmentsAttachmentTitle)
