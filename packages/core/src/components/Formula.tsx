import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'

function Formula({ element, className }: ExamComponentProps) {
  const svg = element.getAttribute('svg')!
  const isDisplayFormula = element.getAttribute('mode') === 'display'

  return (
    <span
      className={classNames('e-formula', { 'e-block': isDisplayFormula }, className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default React.memo(Formula)
