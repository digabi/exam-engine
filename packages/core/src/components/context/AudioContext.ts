import React from 'react'
import { getNumericAttribute } from '../../dom-utils'
import { withContext } from './withContext'
import { ExamComponentProps } from '../../createRenderChildNodes'

interface AudioContext {
  bitRate?: number
  saveInterval?: number
}

export const AudioContext = React.createContext<AudioContext>({} as AudioContext)

export const withAudioContext = withContext<AudioContext, ExamComponentProps>(AudioContext, ({ element }) => ({
  bitRate: getNumericAttribute(element, 'bit-rate'),
  saveInterval: getNumericAttribute(element, 'save-interval')
}))
