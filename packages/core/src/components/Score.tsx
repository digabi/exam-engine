import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function Score({ size = 'small', score }: { size?: 'inline' | 'small' | 'large'; score: number }) {
  const { t } = useTranslation()
  const Tag = size === 'inline' ? 'sup' : 'span'
  return (
    <Tag
      className={classNames('e-score e-nowrap', {
        'e-score--small e-font-size-m e-semibold': size === 'small',
        'e-score--large e-font-size-l e-semibold': size === 'large',
        'e-score--inline e-font-size-xs': size === 'inline'
      })}
      aria-label={t('points-screen-reader', { count: score })}
    >
      {t('points', { count: score })}
    </Tag>
  )
}
