import React from 'react'
import { useExamTranslation } from '../../i18n'
import NotificationIcon from '../NotificationIcon'

const AnswerLengthInfo: React.FunctionComponent<{ maxLength: number; id?: string }> = ({ maxLength, id }) => {
  const { t } = useExamTranslation()

  return (
    <p id={id} className="e-answer-length-info">
      <NotificationIcon />
      <em>{t('max-length-info', { count: maxLength })}</em>
    </p>
  )
}

export default React.memo(AnswerLengthInfo)
