import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { getNumericAttribute, queryAncestors } from '../dom-utils'
import { CommonExamContext } from './CommonExamContext'
import ResponsiveMediaContainer from './ResponsiveMediaContainer'
import { ExamComponentProps } from '../createRenderChildNodes'
import { imageCaptionId } from '../ids'

function Image({ element, className, renderChildNodes }: ExamComponentProps) {
  const { t } = useTranslation()
  const src = element.getAttribute('src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!
  const caption = element.hasChildNodes() ? renderChildNodes(element) : undefined
  const imgUrl = useContext(CommonExamContext).resolveAttachment(src)
  const captionId = caption != null ? imageCaptionId(element) : undefined
  const Img = () => <img className="e-image" src={imgUrl} aria-labelledby={captionId} />

  return (
    <>
      <ResponsiveMediaContainer
        {...{
          className,
          width,
          height,
          caption,
          captionId,
          bordered: caption != null || queryAncestors(element, 'choice-answer') != null,
        }}
      >
        {queryAncestors(element, ['choice-answer', 'hint']) != null ? (
          <Img />
        ) : (
          <a
            title={t('zoom-in')}
            href={imgUrl}
            target="original-picture"
            className="e-zoomable"
            aria-hidden={caption == null}
          >
            <Img />
          </a>
        )}
      </ResponsiveMediaContainer>
    </>
  )
}

export default React.memo(Image)
