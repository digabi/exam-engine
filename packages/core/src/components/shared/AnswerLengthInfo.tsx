import React from 'react'
import { useExamTranslation } from '../../i18n'
import NotificationIcon from '../NotificationIcon'

const AnswerLengthInfo: React.FunctionComponent<{ maxLength: number }> = ({ maxLength }) => {
  const { t } = useExamTranslation()
  return (
    <p>
      <NotificationIcon />
      <em>{t('max-length-info', { count: maxLength })}</em>
    </p>
  )
}

export default React.memo(AnswerLengthInfo)
