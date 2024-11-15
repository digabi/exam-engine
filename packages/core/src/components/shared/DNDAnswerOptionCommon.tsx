import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { query } from '../../dom-utils'

export const DNDAnswerOptionCommon = ({
  element,
  renderChildNodes,
  style
}: ExamComponentProps & {
  style?: React.CSSProperties
}) => {
  const hasImages = !!query(element, 'image')
  const hasFormula = !!query(element, 'formula')

  const hasTitle = renderChildNodes(element).length > 0

  return (
    <div
      className={classNames({
        'has-images': hasImages,
        'has-formula': hasFormula
      })}
      style={style}
    >
      <div className="option-content">
        {!hasTitle ? <i style={{ color: 'grey' }}>Tähän tulee vastaus...</i> : renderChildNodes(element)}
      </div>
    </div>
  )
}
