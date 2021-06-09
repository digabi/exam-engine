import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getAttribute, getNumericAttribute, queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { imageCaptionId } from '../../ids'
import { CommonExamContext } from '../context/CommonExamContext'
import ResponsiveMediaContainer from './internal/ResponsiveMediaContainer'

function Image({ element, className, renderChildNodes }: ExamComponentProps) {
  const { resolveAttachment } = useContext(CommonExamContext)
  const { t } = useExamTranslation()

  const src = getAttribute(element, 'src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!

  const caption = renderChildNodes(element)
  const hasCaption = caption.some(_.isObjectLike)
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
            tabIndex={-1}
          >
            {image}
          </a>
        )}
      </ResponsiveMediaContainer>
    </>
  )
}

export default React.memo(Image)
