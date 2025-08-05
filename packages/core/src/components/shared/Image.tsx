import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, getAttribute, getNumericAttribute, queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { imageCaptionId } from '../../ids'
import { CommonExamContext } from '../context/CommonExamContext'
import ResponsiveMediaContainer from './internal/ResponsiveMediaContainer'
import { isWhitespace } from '../../utils'

function Image(props: ExamComponentProps) {
  const { resolveAttachment } = useContext(CommonExamContext)
  return <ImageBase {...{ ...props, resolveAttachment }} />
}

export function ImageBase({
  element,
  className,
  renderChildNodes,
  resolveAttachment,
  disableZoomIn,
  onMaxWidthCalculated
}: ExamComponentProps & {
  resolveAttachment: (filename: string) => string
  disableZoomIn?: boolean
  onMaxWidthCalculated?: (maxWidth: number) => void
}) {
  const src = getAttribute(element, 'src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!

  const title = findChildElement(element, 'image-title')
  const children = title && renderChildNodes(title)
  const hasCaption = children != null && !children.every(isWhitespace)
  const caption = hasCaption ? children : undefined
  const captionId = hasCaption ? imageCaptionId(element) : undefined

  const imgUrl = resolveAttachment(src)
  const image = <img className="e-image" src={imgUrl} alt="" aria-labelledby={captionId} />

  return (
    <>
      <ResponsiveMediaContainer
        {...{
          className,
          width,
          height,
          caption,
          captionId,
          bordered: hasCaption || queryAncestors(element, 'choice-answer') != null,
          onMaxWidthCalculated
        }}
      >
        {disableZoomIn || queryAncestors(element, ['choice-answer', 'hint']) != null ? (
          image
        ) : (
          <ZoomInImage image={image} hasCaption={hasCaption} imgUrl={imgUrl} />
        )}
      </ResponsiveMediaContainer>
    </>
  )
}

function ZoomInImage({ image, imgUrl, hasCaption }: { image: React.JSX.Element; imgUrl: string; hasCaption: boolean }) {
  const { t } = useExamTranslation()

  return (
    <a
      title={t.raw('zoom-in')}
      href={imgUrl}
      target="original-picture"
      className="e-zoomable"
      aria-hidden={!hasCaption}
      tabIndex={-1}
    >
      {image}
    </a>
  )
}

export default React.memo(Image)
