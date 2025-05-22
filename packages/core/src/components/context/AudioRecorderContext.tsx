import React, { Dispatch, SetStateAction, useState } from 'react'
import { withContext } from './withContext'
import { ExamComponentProps } from '../../createRenderChildNodes'

interface AudioRecorderContextProps {
  alreadyRecordingState: [boolean, Dispatch<SetStateAction<boolean>>]
}

export const AudioRecorderContext = React.createContext<AudioRecorderContextProps>({} as AudioRecorderContextProps)

export const withAudioRecorderContext = withContext<AudioRecorderContextProps, ExamComponentProps>(
  AudioRecorderContext,
  () => ({
    alreadyRecordingState: useState<boolean>(false)
  })
)
