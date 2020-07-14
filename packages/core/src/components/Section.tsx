import classNames from 'classnames'
import React from 'react'

const Section: React.FunctionComponent<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> = (
  props
) => {
  const className = classNames('e-section e-bg-color-off-white e-pad-6', props.className)
  return <section {...{ ...props, className }}>{props.children}</section>
}

export default Section
