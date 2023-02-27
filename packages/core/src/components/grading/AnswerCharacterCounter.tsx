import React from 'react'
import { useExamTranslation } from '../../i18n'

export function AnswerCharacterCounter({
  characterCount,
  maxLength,
}: {
  characterCount: number
  maxLength: number | undefined
}) {
  const { t } = useExamTranslation()
  const percentage = countSurplusPercentage(characterCount, maxLength)

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

function countSurplusPercentage(characters: number, maxCharacters: number | undefined | null): number {
  if (!maxCharacters || characters <= maxCharacters) {
    return 0
  }
  return Math.floor((100 * characters) / maxCharacters - 100)
}
