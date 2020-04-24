import React, { useContext, useState } from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'
import { getNumericAttribute, mapChildElements } from '../dom-utils'
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ResponsiveMediaContainer from './ResponsiveMediaContainer'
import { CommonExamContext } from './CommonExamContext'
import classNames from 'classnames'
import * as _ from 'lodash-es'

function ImageOverlay({ element, renderChildNodes }: ExamComponentProps) {
  const [opacities, setOpacities] = useState<number[]>(() => _.times(element.children.length, (i) => (i === 0 ? 1 : 0)))

  const onSetSliderValue = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedSliders = [...opacities]
    updatedSliders[index] = Number(event.target.value)
    setOpacities(updatedSliders)
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
              setSliderValue={(e) => onSetSliderValue(e, index)}
              renderChildNodes={renderChildNodes}
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
  setSliderValue: React.ChangeEventHandler<HTMLInputElement>
}

function Slider({ opacity, setSliderValue, element, renderChildNodes }: SliderProps) {
  return (
    <div className="e-columns e-columns--center-v e-mrg-b-1">
      <div className="e-column e-text-right e-mrg-r-1">{renderChildNodes(element)}</div>
      <FontAwesomeIcon icon={faEyeSlash} className="e-mrg-r-1" />
      <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={setSliderValue}></input>
      <FontAwesomeIcon icon={faEye} className="e-mrg-l-1" />
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
        opacity: opacity,
      }}
    >
      <ResponsiveMediaContainer
        {...{
          width,
          height,
        }}
      >
        <img className="e-image" src={imgUrl} />
      </ResponsiveMediaContainer>
    </div>
  )
}

export default React.memo(ImageOverlay)
