import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, queryAncestors } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'

export const Recording: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const transcription = findChildElement(element, ['audio-transcription', 'video-transcription'])

  if (transcription) {
    const { t } = useExamTranslation()
    const title = findChildElement(element, ['audio-title', 'video-title'])

    return (
      <details className="e-grading-instruction-recording e-pad-1 e-mrg-b-2">
        <summary>
          <strong>{t('recording')}</strong> {title && <em>{renderChildNodes(title)}</em>}
        </summary>
        {renderChildNodes(transcription)}
      </details>
    )
  }

  const isInDndAnswer = queryAncestors(element, 'dnd-answer')
  return isInDndAnswer ? '[Audio]' : null
}

export default Recording
