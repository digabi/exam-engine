import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement } from '../../dom-utils'

export const Audio: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const hasTranscription = findChildElement(element, 'audio-transcription') != null

  return hasTranscription ? (
    <details className="e-grading-instruction-audio e-pad-1 e-mrg-b-2">{renderChildNodes(element)}</details>
  ) : null
}

export default Audio
