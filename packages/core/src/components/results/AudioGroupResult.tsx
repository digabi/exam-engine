import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../types'

function AudioGroupResult({ element, className, renderChildNodes }: ExamComponentProps) {
  return <div className={classNames('e-audio-group', className)}>{renderChildNodes(element)}</div>
}

export default React.memo(AudioGroupResult)
