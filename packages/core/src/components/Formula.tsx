import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'

function Formula({ element, className }: ExamComponentProps) {
  const svg = element.getAttribute('svg')!
  const mml = element.getAttribute('mml')!
  const isDisplayFormula = element.getAttribute('mode') === 'display'

  const html = svg + '<span class="e-screen-reader-only" role="presentation">' + mml + '</span>'
  return (
    <span
      className={classNames('e-formula', { 'e-block': isDisplayFormula }, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default React.memo(Formula)
