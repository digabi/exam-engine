import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'
import { getAttribute } from '../dom-utils'

function Formula({ element, className }: ExamComponentProps) {
  const svg = getAttribute(element, 'svg')!
  const assistiveTitle = getAttribute(element, 'assistive-title')
  const isDisplayFormula = getAttribute(element, 'mode') === 'display'

  return (
    <>
      <span
        className={classNames('e-formula', { 'e-block': isDisplayFormula }, className)}
        dangerouslySetInnerHTML={{ __html: svg }}
        aria-hidden="true"
      />
      <span className="e-screen-reader-only">{assistiveTitle || element.textContent}</span>
    </>
  )
}

export default React.memo(Formula)
