import React from 'react'
import { createRenderChildNodes, ExamComponentProps } from '../createRenderChildNodes'
import { queryAncestors } from '../dom-utils'
import AttachmentLink from './AttachmentLink'
import AttachmentLinks from './AttachmentLinks'
import AttachmentsAttachment from './AttachmentsAttachment'
import AttachmentsAttachmentTitle from './AttachmentsAttachmentTitle'
import Audio from './Audio'
import ExternalMaterialList from './ExternalMaterialList'
import File from './File'
import Formula from './Formula'
import Image from './Image'
import Reference from './Reference'
import surround from './surround'
import Video from './Video'
import ImageOverlay from './ImageOverlay'

const renderChildNodes = createRenderChildNodes({
  'attachment-link': AttachmentLink,
  'attachment-links': AttachmentLinks,
  'attachment-title': AttachmentsAttachmentTitle,
  attachment: AttachmentsAttachment,
  audio: Audio,
  file: File,
  image: Image,
  video: Video,
  formula: Formula,
  reference: surround(Reference, 'figcaption', { className: 'e-color-darkgrey e-mrg-y-2 e-font-size-s e-light' }),
  'image-overlay': ImageOverlay,
})

interface AttachmentsExternalMaterialProps extends ExamComponentProps {
  forceRender?: boolean // TODO: Figure out a better way to selectively not render some XML elements.
}

function AttachmentsExternalMaterial({ element, forceRender = false }: AttachmentsExternalMaterialProps) {
  if (queryAncestors(element, 'question') == null && !forceRender) {
    return null
  }

  const attachmentCount = element.children.length

  return (
    <>
      {attachmentCount > 1 && (
        <ExternalMaterialList {...{ element, renderChildNodes, showTitle: false, forceRender }} />
      )}
      {renderChildNodes(element)}
    </>
  )
}

export default React.memo(AttachmentsExternalMaterial)
