import React from 'react'
import { useExamTranslation } from '../../i18n'

export function AnswerCharacterCounter({
  characterCount,
  percentage,
  maxLength,
}: {
  characterCount: number
  percentage: number
  maxLength: number | undefined
}) {
  const { t } = useExamTranslation()

  return (
    <div className="e-font-size-xs e-grading-answer-length">
      {t('answer-length', {
        count: characterCount,
      })}
      {percentage > 0 ? (
        <span className="e-grading-answer-max-length-surplus">
          {t('max-length-surplus', {
            maxLength,
            percentage,
          })}
        </span>
      ) : (
        ''
      )}
    </div>
  )
}
