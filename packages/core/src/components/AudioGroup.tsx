import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'

function AudioGroup({ element, className, renderChildNodes }: ExamComponentProps) {
  return (
    <div className={classNames('e-audio-group', className)}>
      <div className="e-audio-group--separator e-font-size-xl e-mrg-y-4 e-color-link" role="separator">
        ✲✲✲
      </div>
      {renderChildNodes(element)}
    </div>
  )
}

export default React.memo(AudioGroup)
