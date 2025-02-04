import classNames from 'classnames'
import * as _ from 'lodash-es'
import React from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getAttribute } from '../../dom-utils'

type Props = Omit<ExamComponentProps, 'renderChildNodes'>

// eslint-disable-next-line prefer-arrow-callback
export default React.memo(function Formula({ element, className }: Props) {
  const svg = getAttribute(element, 'svg')!
  const textContent = element.textContent?.trim()
  const assistiveTitle = (getAttribute(element, 'assistive-title') || textContent) ?? ''
  const isDisplayFormula = getAttribute(element, 'mode') === 'display'
  return (
    <>
      <span
        className={classNames('e-formula', { 'e-block e-text-center': isDisplayFormula }, className)}
        dangerouslySetInnerHTML={{ __html: svg }}
        aria-hidden="true"
      />
      <span className="e-screen-reader-only">{assistiveTitle}</span>
    </>
  )
})
