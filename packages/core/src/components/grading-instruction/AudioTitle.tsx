import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { faHeadphones } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const AudioTitle: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  return (
    <summary>
      <FontAwesomeIcon className="e-mrg-r-1" icon={faHeadphones} />
      <em>{renderChildNodes(element)}</em>
    </summary>
  )
}

export default AudioTitle
