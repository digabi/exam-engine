import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { useExamTranslation } from '../../i18n'

export const AudioTitle: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const { t } = useExamTranslation()

  return (
    <summary>
      <strong>{t('audio.transcription')}</strong> <em>{renderChildNodes(element)}</em>
    </summary>
  )
}

export default AudioTitle
