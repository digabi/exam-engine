import React from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, mapChildElements, queryAll } from '../../dom-utils'

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const dndAnswerGroupIds = queryAll(element, 'dnd-answer-group').map(e => e.getAttribute('question-id')!)
  const dndAnswerOptionIds = queryAll(element, 'dnd-answer-option').map(e => e.getAttribute('option-id')!)
  console.log('dndAnswerGroupIds', dndAnswerGroupIds, 'dndAnswerOptionIds', dndAnswerOptionIds)

  const defaultItems = {
    root: dndAnswerOptionIds.map((_option, index) => index),
    ...dndAnswerGroupIds.reduce((acc, _group, groupIndex) => ({ ...acc, [groupIndex]: [] }), {})
  }

  console.log('defaultItems', defaultItems)

  return (
    <div>
      <b>{element.tagName}</b>
      {renderChildNodes(element)}

      <h4>Render default container here:</h4>
      <div className="e-dnd-answer-group">
        {defaultItems.root.map((_item, index) => (
          <div key={index}>
            <b>item {index}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

export const DNDAnswerGroup = ({ element, renderChildNodes }: ExamComponentProps) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  return (
    <div className="e-dnd-answer-group" data-question-id={questionId}>
      <b>
        {element.tagName} (id {questionId}):
      </b>
      <br />
      {mapChildElements(element, (childElement, index) =>
        childElement.nodeName === 'e:dnd-answer-title' ? (
          <DNDAnswerTitle element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ) : childElement.nodeName === 'e:dnd-answer-option' ? (
          <DNDAnswerOption element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ) : null
      )}
    </div>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => (
  <div className="e-dnd-answer-title">
    <b>{element.tagName}</b>
    {renderChildNodes(element)}
  </div>
)

const DNDAnswerOption = ({ element, renderChildNodes }: ExamComponentProps) => {
  const optionId = getNumericAttribute(element, 'option-id')!
  return (
    <div className="e-dnd-answer-option">
      <b>
        {element.tagName} (id {optionId}):
      </b>
      {mapChildElements(element, (childElement, index) => (
        <DNDAnswerOptionContent element={childElement} renderChildNodes={renderChildNodes} key={index} />
      ))}
    </div>
  )
}

const DNDAnswerOptionContent = ({ element, renderChildNodes }: ExamComponentProps) => (
  <div>{renderChildNodes(element)}</div>
)
