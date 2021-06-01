import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'

export const Audio: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  return Array.from(element.childNodes).some((x) => x.nodeName === 'e:audio-transcription') ? (
    <details className="e-grading-instruction-audio e-pad-1 e-mrg-b-2">{renderChildNodes(element)}</details>
  ) : (
    <></>
  )
}

export default Audio
