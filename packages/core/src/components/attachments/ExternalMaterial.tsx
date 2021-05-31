import React from 'react'
import { createRenderChildNodes, ExamComponentProps } from '../../createRenderChildNodes'
import { queryAncestors } from '../../dom-utils'
import mkAttachmentLink from '../shared/AttachmentLink'
import mkAttachmentLinks from '../shared/AttachmentLinks'
import Attachment from './Attachment'
import AttachmentTitle from './AttachmentTitle'
import Audio from '../shared/Audio'
import ExamExternalMaterial from '../exam/ExternalMaterial'
import File from '../shared/File'
import Formula from '../shared/Formula'
import Image from '../shared/Image'
import Reference from '../shared/Reference'
import surround from '../surround'
import Video from '../shared/Video'
import ImageOverlay from '../shared/ImageOverlay'
import RenderChildNodes from '../RenderChildNodes'

const renderChildNodes = createRenderChildNodes({
  'attachment-link': mkAttachmentLink('link'),
  'attachment-links': mkAttachmentLinks('link'),
  'attachment-title': AttachmentTitle,
  attachment: Attachment,
  audio: Audio,
  'audio-title': RenderChildNodes,
  file: File,
  image: Image,
  'image-title': RenderChildNodes,
  video: Video,
  formula: Formula,
  reference: surround(Reference, 'div', { className: 'e-color-darkgrey e-mrg-y-2 e-font-size-s e-light' }),
  'image-overlay': ImageOverlay,
})

interface AttachmentsExternalMaterialProps extends ExamComponentProps {
  forceRender?: boolean // TODO: Figure out a better way to selectively not render some XML elements.
}

function ExternalMaterial({ element, forceRender = false }: AttachmentsExternalMaterialProps) {
  if (queryAncestors(element, 'question') == null && !forceRender) {
    return null
  }

  const attachmentCount = element.children.length

  return (
    <>
      {attachmentCount > 1 && (
        <ExamExternalMaterial {...{ element, renderChildNodes, showTitle: false, forceRender }} />
      )}
      {renderChildNodes(element)}
    </>
  )
}

export default React.memo(ExternalMaterial)
