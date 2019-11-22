import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from './types'

function Formula({ element, className }: ExamComponentProps) {
  const svg = element.getAttribute('svg')!
  const mml = element.getAttribute('mml')!
  const mode = element.getAttribute('mode') || 'inline'
  const Tag = mode === 'inline' ? 'span' : 'div'

  const html = svg + '<span class="e-screen-reader-only" role="presentation">' + mml + '</span>'
  return <Tag className={classNames('e-formula', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

export default React.memo(Formula)
