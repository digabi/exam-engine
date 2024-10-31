import React from 'react'
import { ExamComponentProps } from '../..'
import { mapChildElements } from '../../dom-utils'

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('answer', element)
  return (
    <div>
      {mapChildElements(element, childElement => (
        <DNDAnswerGroup element={childElement} renderChildNodes={renderChildNodes} />
      ))}
    </div>
  )
}

const DNDAnswerGroup = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('group', element)
  return (
    <div>
      {renderChildNodes(element)}
      {mapChildElements(element, childElement => (
        <DNDAnswerOption element={childElement} renderChildNodes={renderChildNodes} />
      ))}
    </div>
  )
}

const DNDAnswerOption = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('option', element)
  return <div>{renderChildNodes(element)}</div>
}
