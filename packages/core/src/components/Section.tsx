import classNames from 'classnames'
import React from 'react'

export default function Section(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) {
  const className = classNames('e-section e-bg-color-off-white e-pad-6', props.className)
  return <section {...{ ...props, className }}>{props.children}</section>
}
