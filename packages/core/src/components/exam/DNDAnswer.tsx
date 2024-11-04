import React from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, mapChildElements, queryAll } from '../../dom-utils'

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('DNDAnswer', element)
  const dndAnswerGroups = queryAll(element, 'dnd-answer-group')
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')
  console.log('dndAnswerGroups', dndAnswerGroups, 'dndAnswerOptions', dndAnswerOptions)
  /*
  const defaultItems = {
    root: dndAnswerOptions.map((_option, index) => index),
    ...dndAnswerGroups.reduce((acc, group, groupIndex) => {
      const options = queryAll(group, 'dnd-answer-option')
      return { ...acc, [groupIndex]: options.map((_option, index) => index) }
    })
  }

  console.log('defaultItems', defaultItems)
*/

  return (
    <div>
      <b>{element.tagName}</b>
      {renderChildNodes(element)}
    </div>
  )
}

export const DNDAnswerGroup = ({ element, renderChildNodes }: ExamComponentProps) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  const displayNumber = element.getAttribute('display-number')!
  console.log('GROUP', questionId, displayNumber, element)

  return (
    <div className="e-dnd-answer-group" data-question-id={questionId}>
      <b>{element.tagName}</b>
      <br />
      {mapChildElements(element, (childElement, index) => {
        console.log('CHILD', childElement, childElement.nodeName)
        return childElement.nodeName === 'e:dnd-answer-title' ? (
          <DNDAnswerTitle element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ) : childElement.nodeName === 'e:dnd-answer-option' ? (
          <DNDAnswerOption element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ) : null
      })}
    </div>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('DNDAnswerTitle', element)
  return (
    <div className="e-dnd-answer-title">
      <b>{element.tagName}</b>
      {renderChildNodes(element)}
    </div>
  )
}

const DNDAnswerOption = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('OPTION', element)
  return (
    <div className="e-dnd-answer-option">
      <b>{element.tagName}:</b>
      {mapChildElements(element, (childElement, index) => (
        <DNDAnswerOptionContent element={childElement} renderChildNodes={renderChildNodes} key={index} />
      ))}
    </div>
  )
}

const DNDAnswerOptionContent = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('option content')
  return <div>{renderChildNodes(element)}</div>
}
