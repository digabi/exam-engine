import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { formatDuration } from '../shared/internal/RestrictedAudioPlayer'
import Audio from '../shared/Audio'

export const AudioPlaceholder: React.FC<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const restricted = !!getNumericAttribute(element, 'times')
  const duration = getNumericAttribute(element, 'duration')!
  const formattedDuration = formatDuration(duration)
  console.log(restricted)

  if (restricted) {
    return <div className="audio-placeholder">Rajoitettu kuuntelu – {formattedDuration}</div>
  } else {
    return <Audio element={element} renderChildNodes={renderChildNodes} />
  }
}
