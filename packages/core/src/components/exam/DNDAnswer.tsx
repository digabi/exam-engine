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
  root: UniqueIdentifier[]
  [key: string]: UniqueIdentifier[]
}

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const groupsWithItemIds = queryAll(element, 'dnd-answer').reduce(
    (acc, group) => {
      const questionId = group.getAttribute('question-id')!
      //const items = queryAll(group, 'dnd-answer-option').map(e => Number(e.getAttribute('option-id')!))
      return { ...acc, [questionId]: [] }
    },
    { root: queryAll(element, 'dnd-answer-option').map(e => Number(e.getAttribute('option-id')!)) }
  )
  const [items, setItems] = useState<ItemsState>(groupsWithItemIds)

  console.log('groupsWithItems', groupsWithItemIds)

  const answerOptionsById = queryAll(element, 'dnd-answer-option').reduce(
    (acc, el) => {
      const questionId = el.getAttribute('option-id')!
      return { ...acc, [questionId]: el }
    },
    {} as Record<UniqueIdentifier, Element>
  )

  console.log('answerOptionsById', answerOptionsById)

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
    return Object.keys(items).find(key => items[key].includes(id))
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const { id } = active

    setActiveId(id)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    const { id } = active
    const overId = over?.id

    // Find the containers
    const activeContainer = findContainer(id)
    const overContainer = overId ? findContainer(overId) : null

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const { id } = active
    const overId = over?.id

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
        const existingValue = newState[to][0]
        newState.root = [...newState.root, existingValue]
      }
      // Move the new value to the target container
      newState[to] = [value]
    }

    console.log('new state after moving value', newState)
    return newState
  }

  const dndAnswerGroups = queryAll(element, 'dnd-answer')

  // We can not render the prop element (XML) here, because the DOM structure will change when we move the items, but XML is static

  const { setNodeRef } = useDroppable({
    id: 'root'
  })

  const rootIds = items.root || []
  const rootAnswerOptions = rootIds.map(id => answerOptionsById[id])

  console.log('ITEMS =', items)
  console.log('rootIds', rootIds)
  console.log('rootAnswerOptions', rootAnswerOptions)

  return (
    <div className="e-dnd-answer-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {dndAnswerGroups.map((element, index) => (
          <DNDAnswerGroup
            element={element}
            renderChildNodes={renderChildNodes}
            key={index}
            items={items}
            answerOptionsById={answerOptionsById}
          />
        ))}

        {/*root items */}
        <div className="e-dnd-answer">
          Not answers: <br />
          <SortableContext id="root" items={items.root} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef}>
              {rootAnswerOptions.map((element, index) => (
                <DNDAnswerOption element={element} renderChildNodes={renderChildNodes} key={index} />
              ))}
            </div>
          </SortableContext>
        </div>
        <DragOverlay>{activeId ? <div>DragOverlay</div> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}

export const DNDAnswerGroup = ({
  element,
  renderChildNodes,
  items,
  answerOptionsById
}: ExamComponentProps & {
  items: ItemsState
  answerOptionsById: Record<UniqueIdentifier, Element>
}) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  //const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

  const groudIds = items[questionId] || []
  const dndAnswerOptions = groudIds.map(id => answerOptionsById[id])
  //console.log('Group = ', questionId, dndAnswerOptions)

  const { setNodeRef, isOver } = useDroppable({
    id: questionId
  })

  return (
    <div className="e-dnd-answer" data-question-id={questionId}>
      <b>
        Answer (id {questionId}) isOver: {isOver ? 'yes' : 'no'}
      </b>
      <br />
      {mapChildElements(element, childElement =>
        childElement.nodeName === 'e:dnd-answer-title' ? (
          <DNDAnswerTitle element={childElement} renderChildNodes={renderChildNodes} />
        ) : null
      )}

      <SortableContext id={String(questionId)} items={groudIds} strategy={verticalListSortingStrategy}>
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
  <div className="e-dnd-answer-title">{renderChildNodes(element)}</div>
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
        <b>(id {optionId}):</b>
        {mapChildElements(element, (childElement, index) => (
          <DNDAnswerOptionContent element={childElement} renderChildNodes={renderChildNodes} key={index} />
        ))}
      </div>
    </div>
  )
}

const DNDAnswerOptionContent = ({ element, renderChildNodes }: ExamComponentProps) => (
  <span>{renderChildNodes(element)}</span>
)
