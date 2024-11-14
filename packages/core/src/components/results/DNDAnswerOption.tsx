import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import React from 'react'
import { ExamComponentProps } from '../..'
import { query } from '../../dom-utils'

export const DNDAnswerOption = ({
  element,
  renderChildNodes
}: ExamComponentProps & {
  value: UniqueIdentifier
}) => {
  const hasImages = !!query(element, 'image')
  const hasFormula = !!query(element, 'formula')

  return (
    <div>
      <div
        className={classNames('e-dnd-answer-option', {
          'has-images': hasImages,
          'has-formula': hasFormula
        })}
      >
        <div className="option-content">{renderChildNodes(element)}</div>
      </div>
    </div>
  )
}
