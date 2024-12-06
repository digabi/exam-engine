import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { audioLabelId } from '../../ids'
import Audio from '../shared/Audio'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDuration } from '../shared/internal/RestrictedAudioPlayer'

export const AudioContainer: React.FC<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const restricted = !!getNumericAttribute(element, 'times')
  const duration = getNumericAttribute(element, 'duration')!
  const labelId = audioLabelId(element)

  if (restricted) {
    return <AudioPlaceholder duration={duration} labelId={labelId} />
  } else {
    return <Audio element={element} renderChildNodes={renderChildNodes} />
  }
}

const AudioPlaceholder: React.FC<{ duration: number; labelId: string }> = ({ duration, labelId }) => (
  <div className="audio e-columns e-columns--center-v e-mrg-b-2">
    <div className="e-pad-1 restricted-audio-player restricted-audio-player--disabled e-columns e-columns--center-v">
      <button
        className="restricted-audio-player__play e-column e-column--narrow"
        disabled={true}
        onClick={() => undefined}
      >
        <FontAwesomeIcon icon={faPlay} fixedWidth />
      </button>
      <span className="e-column e-text-right e-column">{formatDuration(duration)}</span>
    </div>

    <span className="e-pad-l-2" id={labelId}>
      <em>Ei kuunneltavissa</em>
    </span>
  </div>
)
