import classNames from 'classnames'
import React from 'react'
import { useExamTranslation } from '../i18n'

export interface ScoreProps {
  id?: string
  size?: 'inline' | 'small' | 'large'
  score: number
}

export const Score: React.FunctionComponent<ScoreProps> = ({ id, size = 'small', score }) => {
  const { t } = useExamTranslation()
  const Tag = size === 'inline' ? 'sup' : 'span'
  return (
    <Tag
      className={classNames('e-score e-nowrap', {
        'e-score--small e-font-size-m e-semibold': size === 'small',
        'e-score--large e-font-size-l e-semibold': size === 'large',
        'e-score--inline e-font-size-xs': size === 'inline',
      })}
      id={id}
    >
      {t('points', { count: score })}
    </Tag>
  )
}
