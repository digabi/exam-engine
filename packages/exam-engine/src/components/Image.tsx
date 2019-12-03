import React, { useContext } from 'react'
import { getNumericAttribute } from '../dom-utils'
import { ExamContext } from './ExamContext'
import ResponsiveMediaContainer from './ResponsiveMediaContainer'
import { ExamComponentProps } from './types'

function Image({ element, className, renderChildNodes }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!
  const caption = element.hasChildNodes() ? renderChildNodes(element) : undefined
  const { resolveAttachment } = useContext(ExamContext)

  return (
    <>
      <ResponsiveMediaContainer
        {...{
          className,
          width,
          height,
          caption,
          bordered: caption != null || element.closest('choice-answer') != null
        }}
      >
        {element.closest('choice-answer, hint') != null ? (
          <img className="image" src={resolveAttachment(src)} />
        ) : (
          <a href={resolveAttachment(src)} target="original-picture" className="e-zoomable">
            <img className="image" src={resolveAttachment(src)} />
          </a>
        )}
      </ResponsiveMediaContainer>
    </>
  )
}

export default React.memo(Image)
