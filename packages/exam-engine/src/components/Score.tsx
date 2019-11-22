import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function Score({ size = 'small', score }: { size?: 'small' | 'large'; score: number }) {
  const { t } = useTranslation()
  return (
    <span
      className={classNames('e-score e-nowrap e-semibold', {
        'e-font-size-m': size === 'small',
        'e-score--large e-font-size-l': size === 'large'
      })}
      aria-label={t('points-screen-reader', { count: score })}
    >
      {t('points', { count: score })}
    </span>
  )
}
