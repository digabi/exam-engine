import React, { useState } from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, mapChildElements, queryAll } from '../../dom-utils'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type ItemsState = {
  //root: UniqueIdentifier[]
  [key: string]: UniqueIdentifier[]
}

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const dndAnswerGroupIds = queryAll(element, 'dnd-answer-group').map(e => e.getAttribute('question-id')!)
  const dndAnswerOptionIds = queryAll(element, 'dnd-answer-option').map(e => e.getAttribute('option-id')!)
  //console.log('dndAnswerGroupIds', dndAnswerGroupIds, 'dndAnswerOptionIds', dndAnswerOptionIds)

  const groupsWithItems = queryAll(element, 'dnd-answer-group').reduce(
    (acc, group) => {
      const questionId = group.getAttribute('question-id')!
      const items = queryAll(group, 'dnd-answer-option').map(e => Number(e.getAttribute('option-id')!))
      return { ...acc, [questionId]: items }
    },
    { root: [] }
  )

  const defaultItems = {
    root: dndAnswerOptionIds,
    ...dndAnswerGroupIds.reduce((acc, group) => ({ ...acc, [group]: [] }), {})
  }

  console.log('defaultItems', defaultItems)
  console.log('groupsWithItems', groupsWithItems)

  const [items, setItems] = useState<ItemsState>(groupsWithItems)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function findContainer(id: UniqueIdentifier) {
    if (id in items) {
      return id
    }

    console.log('find container for id', id)
    console.log('items = ', items)

    return Object.keys(items).find(key => items[key].includes(id))
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const { id } = active

    console.log('handleDragStart', id)

    setActiveId(id)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    const { id } = active
    const overId = over?.id
    //const { id: overId } = over

    // Find the containers
    const activeContainer = findContainer(id)
    const overContainer = overId ? findContainer(overId) : null

    console.log(
      'handleDragOver',
      id,
      'over',
      overId,
      'activeContainer',
      activeContainer,
      'overContainer',
      overContainer
    )

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const { id } = active
    const overId = over?.id
    //const { id: overId } = over

    const activeContainer = findContainer(id)
    const overContainer = overId ? findContainer(overId) : null

    if (!activeContainer || !overContainer) {
      return
    }

    setItems(items => moveValue(items, activeContainer, overContainer, active.id))
    setActiveId(null)
  }

  function moveValue(state: ItemsState, from: UniqueIdentifier, to: UniqueIdentifier, value: UniqueIdentifier) {
    // Clone the state to ensure immutability
    const newState: ItemsState = { ...state }

    // Remove the value from its current container
    newState[from] = newState[from].filter(item => item !== value)

    // If moving to root, simply add the value to root
    if (to === 'root') {
      newState.root = [...newState.root, value]
    } else {
      // If the target container is not empty, move the existing value back to root
      if (newState[to].length > 0) {
        console.log("target container isn't empty")
        const existingValue = newState[to][0]
        console.log('existingValue was', existingValue)
        newState.root = [...newState.root, existingValue]
      }
      // Move the new value to the target container
      newState[to] = [value]
    }

    console.log('new state after moving value', newState)
    return newState
  }

  const dndAnswerGroups = queryAll(element, 'dnd-answer-group')
  //console.log('dndAnswerGroups', dndAnswerGroups)

  console.log('ITEMS =', items)

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <b>{element.tagName}</b>
        {renderChildNodes(element)}

        {dndAnswerGroups.map((element, index) => (
          <DNDAnswerGroup element={element} renderChildNodes={renderChildNodes} key={index} items={items} />
        ))}

        <h4>Render default container here:</h4>
        <div className="e-dnd-answer-group">
          {defaultItems.root.map((_item, index) => (
            <div key={index}>
              <b>item {index}</b>
            </div>
          ))}
        </div>
        <DragOverlay>{activeId ? <div>DragOverlay</div> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}

export const DNDAnswerGroup = ({
  element,
  renderChildNodes,
  items
}: ExamComponentProps & {
  items: ItemsState
}) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')
  //console.log('dndAnswerOptions', dndAnswerOptions)

  const { setNodeRef } = useDroppable({
    id: questionId
  })

  const groupItems = items[questionId] || []

  return (
    <div className="e-dnd-answer-group" data-question-id={questionId}>
      <b>
        {element.tagName} (id {questionId}):
      </b>
      <br />
      {mapChildElements(element, (childElement, index) =>
        childElement.nodeName === 'e:dnd-answer-title' ? (
          <DNDAnswerTitle element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ) : null
      )}

      <SortableContext id={String(questionId)} items={groupItems} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef}>
          {dndAnswerOptions.map((element, index) => (
            <DNDAnswerOption element={element} renderChildNodes={renderChildNodes} key={index} />
          ))}
        </div>
      </SortableContext>
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

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: optionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="e-dnd-answer-option">
        <b>
          {element.tagName} (id {optionId}):
        </b>
        {mapChildElements(element, (childElement, index) => (
          <DNDAnswerOptionContent element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ))}
      </div>
    </div>
  )
}

const DNDAnswerOptionContent = ({ element, renderChildNodes }: ExamComponentProps) => (
  <div>{renderChildNodes(element)}</div>
)
