import React from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, mapChildElements, queryAll } from '../../dom-utils'

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  const displayNumber = element.getAttribute('display-number')!
  console.log('Answer questionId', questionId)
  console.log('Answer displayNumber', displayNumber)

  const dndAnswerGroups = queryAll(element, 'dnd-answer-group')
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

  const defaultItems = {
    root: dndAnswerOptions.map((_option, index) => index),
    ...dndAnswerGroups.reduce((acc, group, groupIndex) => {
      const options = queryAll(group, 'dnd-answer-option')
      return { ...acc, [groupIndex]: options.map((_option, index) => index) }
    })
  }

  console.log('defaultItems', defaultItems)

  return (
    <div>
      {mapChildElements(element, childElement => (
        <DNDAnswerGroup element={childElement} renderChildNodes={renderChildNodes} />
      ))}
    </div>
  )
}

const DNDAnswerGroup = ({ element, renderChildNodes }: ExamComponentProps) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  const displayNumber = element.getAttribute('display-number')!
  console.log('group questionId', questionId)
  console.log('group displayNumber', displayNumber)

  return (
    <div className="e-dnd-answer-group">
      Group:
      {renderChildNodes(element)}
      {mapChildElements(element, childElement => (
        <DNDAnswerOption element={childElement} renderChildNodes={renderChildNodes} />
      ))}
    </div>
  )
}

const DNDAnswerOption = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('option')
  return <div className="e-dnd-answer-option">Option: {renderChildNodes(element)}</div>
}
