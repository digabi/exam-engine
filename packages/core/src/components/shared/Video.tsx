import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { findChildElement, getAttribute, getNumericAttribute } from '../../dom-utils'
import { CommonExamContext } from '../context/CommonExamContext'
import ResponsiveMediaContainer from './internal/ResponsiveMediaContainer'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { videoCaptionId } from '../../ids'
import { isWhitespace } from '../../utils'

function Video({ element, renderChildNodes, className }: ExamComponentProps) {
  const { resolveAttachment } = useContext(CommonExamContext)

  const src = getAttribute(element, 'src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!

  const title = findChildElement(element, 'video-title')
  const children = title && renderChildNodes(title)
  const hasCaption = children != null && !children.every(isWhitespace)
  const caption = hasCaption ? children : undefined
  const captionId = hasCaption ? videoCaptionId(element) : undefined

  return (
    <ResponsiveMediaContainer {...{ caption, captionId, className, width, height }}>
      <video
        className="video"
        preload="metadata"
        controls
        controlsList="nodownload"
        disablePictureInPicture
        aria-describedby={captionId}
      >
        <source src={resolveAttachment(src)} />
      </video>
    </ResponsiveMediaContainer>
  )
}

export default React.memo(Video)
