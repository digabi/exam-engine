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

export const DNDAnswerGroup = ({ element, renderChildNodes }: ExamComponentProps) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  const displayNumber = element.getAttribute('display-number')!
  console.log('GROUP', element)

  return (
    <div className="e-dnd-answer-group">
      Group: questionId = {questionId}, displayNumber = {displayNumber}
      <br />
      Groups child elements:
      {mapChildElements(element, childElement => {
        console.log('CHILD', childElement, childElement.nodeName, childElement.tagName, childElement.nodeType)
        return childElement.nodeName === 'e:dnd-answer-title' ? (
          <DNDAnswerTitle element={childElement} renderChildNodes={renderChildNodes} />
        ) : (
          <DNDAnswerOption element={childElement} renderChildNodes={renderChildNodes} />
        )
      })}
    </div>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('DNDAnswerTitle', element)
  return (
    <div className="e-dnd-answer-option">
      Answer title:
      {renderChildNodes(element)}
      {/*mapChildElements(element, childElement => (
        <DNDAnswerOptionContent element={childElement} renderChildNodes={renderChildNodes} />
      ))*/}
    </div>
  )
}

const DNDAnswerOption = ({ element, renderChildNodes }: ExamComponentProps) => {
  const optionId = element.getAttribute('option-id')!
  console.log('OPTION', element)
  return (
    <div className="e-dnd-answer-option">
      Option {optionId} child elements:
      {mapChildElements(element, childElement => (
        <DNDAnswerOptionContent element={childElement} renderChildNodes={renderChildNodes} />
      ))}
    </div>
  )
}

const DNDAnswerOptionContent = ({ element, renderChildNodes }: ExamComponentProps) => {
  console.log('option content')
  return <div className="e-dnd-answer-option">Option content: {renderChildNodes(element)}</div>
}
