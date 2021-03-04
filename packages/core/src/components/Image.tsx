import React, { useContext } from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'
import { getNumericAttribute, queryAncestors } from '../dom-utils'
import { useExamTranslation } from '../i18n'
import { imageCaptionId } from '../ids'
import { CommonExamContext } from './CommonExamContext'
import ResponsiveMediaContainer from './ResponsiveMediaContainer'

function Image({ element, className, renderChildNodes }: ExamComponentProps) {
  const { t } = useExamTranslation()
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
            title={t.raw('zoom-in')}
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
