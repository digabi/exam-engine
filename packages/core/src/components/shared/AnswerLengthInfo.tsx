import React from 'react'
import { useExamTranslation } from '../../i18n'
import NotificationIcon from '../NotificationIcon'

const AnswerLengthInfo: React.FunctionComponent<{ minLength?: number; maxLength: number; id?: string }> = ({
  minLength,
  maxLength,
  id,
}) => {
  const { t } = useExamTranslation()
  const answerLength = [minLength, maxLength]

  return (
    <p id={id} className="e-answer-length-info">
      <NotificationIcon />
      <em>{t('answer-length-info', { answerLength })}</em>
    </p>
  )
}

export default React.memo(AnswerLengthInfo)
