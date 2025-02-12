import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import * as _ from 'lodash-es'
import React, { useContext, useState } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, getNumericAttribute, mapChildElements } from '../../dom-utils'
import { CommonExamContext } from '../context/CommonExamContext'
import ResponsiveMediaContainer from './internal/ResponsiveMediaContainer'

function ImageOverlay({ element, renderChildNodes, renderComponentOverrides }: ExamComponentProps) {
  const [opacities, setOpacities] = useState<number[]>(() => _.times(element.children.length, i => (i === 0 ? 1 : 0)))
  const mkSetOpacity = (index: number) => (opacity: number) => {
    const updatedOpacities = [...opacities]
    updatedOpacities[index] = opacity
    setOpacities(updatedOpacities)
  }

  return (
    <div className="e-image-overlay e-mrg-b-1">
      <div className="e-columns e-columns--center-h">
        <div>
          {mapChildElements(element, (child, index) => (
            <Slider
              key={index}
              opacity={opacities[index]}
              element={child}
              setOpacity={mkSetOpacity(index)}
              renderChildNodes={renderChildNodes}
              renderComponentOverrides={renderComponentOverrides}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="e-image-overlay__images-wrapper">
          {mapChildElements(element, (child, index) => (
            <ImageOverlayImage
              key={index}
              element={child}
              renderChildNodes={renderChildNodes}
              renderComponentOverrides={renderComponentOverrides}
              opacity={opacities[index]}
              absolute={index > 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SliderProps extends ExamComponentProps {
  opacity: number
  setOpacity: (opacity: number) => void
}

function Slider({ opacity, setOpacity, element, renderChildNodes }: SliderProps) {
  const title = findChildElement(element, 'image-title')

  return (
    <div className="e-columns e-columns--center-v e-mrg-b-1">
      <div className="e-column e-text-right e-mrg-r-1">{title && renderChildNodes(title)}</div>
      <FontAwesomeIcon icon={faEyeSlash} className="e-mrg-r-1 e-pointer" onClick={() => setOpacity(0)} />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={opacity}
        onChange={e => setOpacity(Number(e.target.value))}
      />
      <FontAwesomeIcon icon={faEye} className="e-mrg-l-1 e-pointer" onClick={() => setOpacity(1)} />
    </div>
  )
}

interface ImageOverlayImageProps extends ExamComponentProps {
  opacity: number
  absolute: boolean
}

function ImageOverlayImage({ element, absolute, opacity }: ImageOverlayImageProps) {
  const src = element.getAttribute('src')!
  const width = getNumericAttribute(element, 'width')!
  const height = getNumericAttribute(element, 'height')!
  const imgUrl = useContext(CommonExamContext).resolveAttachment(src)
  return (
    <div
      className={classNames('e-columns e-columns--center-h', { 'e-image-overlay__image-absolute': absolute })}
      style={{
        opacity: opacity
      }}
    >
      <ResponsiveMediaContainer
        {...{
          width,
          height
        }}
      >
        <img className="e-image" src={imgUrl} />
      </ResponsiveMediaContainer>
    </div>
  )
}

export default React.memo(ImageOverlay)
