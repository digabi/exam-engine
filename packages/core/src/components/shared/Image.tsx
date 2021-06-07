import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute, queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { imageCaptionId } from '../../ids'
import { CommonExamContext } from '../context/CommonExamContext'
import ResponsiveMediaContainer from './internal/ResponsiveMediaContainer'

function Image({ element, className, renderChildNodes }: ExamComponentProps) {
  const { t } = useExamTranslation()
  const src = element.getAttribute('src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!
  const caption = renderChildNodes(element)
  const imgUrl = useContext(CommonExamContext).resolveAttachment(src)
  const captionId = caption.length > 0 ? imageCaptionId(element) : undefined
  const image = <img className="e-image" src={imgUrl} alt="" aria-labelledby={captionId} />
  const hasCaption = caption.length > 0

  return (
    <>
      <ResponsiveMediaContainer
        {...{
          className,
          width,
          height,
          caption: hasCaption ? caption : undefined,
          captionId,
          bordered: hasCaption || queryAncestors(element, 'choice-answer') != null,
        }}
      >
        {queryAncestors(element, ['choice-answer', 'hint']) != null ? (
          image
        ) : (
          <a
            title={t.raw('zoom-in')}
            href={imgUrl}
            target="original-picture"
            className="e-zoomable"
            aria-hidden={!hasCaption}
            tabIndex={!hasCaption ? -1 : undefined}
          >
            {image}
          </a>
        )}
      </ResponsiveMediaContainer>
    </>
  )
}

export default React.memo(Image)
