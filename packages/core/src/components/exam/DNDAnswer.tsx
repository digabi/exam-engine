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
import classNames from 'classnames'
import React, { useState } from 'react'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, mapChildElements, query, queryAll } from '../../dom-utils'

type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const groupsWithItemIds = queryAll(element, 'dnd-answer').reduce(
    (acc, group) => {
      const questionId = group.getAttribute('question-id')!
      return { ...acc, [questionId]: [] }
    },
    { root: queryAll(element, 'dnd-answer-option').map(e => Number(e.getAttribute('option-id')!)) }
  )
  const [items, setItems] = useState<ItemsState>(groupsWithItemIds)

  const answerOptionsById = queryAll(element, 'dnd-answer-option').reduce(
    (acc, el) => {
      const questionId = el.getAttribute('option-id')!
      return { ...acc, [questionId]: el }
    },
    {} as Record<UniqueIdentifier, Element>
  )

  //console.log('groupsWithItems', groupsWithItemIds)
  //console.log('answerOptionsById', answerOptionsById)

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
    setActiveId(event.active.id)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    const activeId = active.id
    const overId = over?.id

    // Find the containers
    const activeContainer = findContainer(activeId)
    const overContainer = overId ? findContainer(overId) : null

    console.log('over container', overContainer)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeId = active.id
    const overId = over?.id

    const activeContainer = findContainer(activeId)
    const overContainer = overId ? findContainer(overId) : null

    if (!activeContainer || !overContainer) {
      return
    }

    setItems(items => moveValue(items, activeContainer, overContainer, activeId))
    setActiveId(null)
  }

  function moveValue(state: ItemsState, from: UniqueIdentifier, to: UniqueIdentifier, value: UniqueIdentifier) {
    // Clone the state to ensure immutability
    const newState: ItemsState = { ...state }

    // Remove the value from its current container
    newState[from] = newState[from].filter(item => item !== value)

    console.log('move value to', to)

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

    return newState
  }

  const dndAnswerGroups = queryAll(element, 'dnd-answer')

  // We can not render the prop 'element' (XML) here, because we will change the DOM structure when we move items, but the XML can not be changed

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
            id={element.getAttribute('question-id')!}
          />
        ))}
        <hr />
        <DNDAnswerGroup
          element={element}
          renderChildNodes={renderChildNodes}
          key="root"
          id="root"
          items={items}
          answerOptionsById={answerOptionsById}
        />
        <DragOverlay>
          {activeId ? (
            <DNDAnswerOption element={answerOptionsById[activeId]} renderChildNodes={renderChildNodes} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export const DNDAnswerGroup = ({
  element,
  renderChildNodes,
  items,
  answerOptionsById,
  id
}: ExamComponentProps & {
  items: ItemsState
  answerOptionsById: Record<UniqueIdentifier, Element>
  id: UniqueIdentifier
}) => {
  const groudIds = items[id] || []
  const dndAnswerOptions = groudIds.map(id => answerOptionsById[id])

  const { setNodeRef, isOver } = useDroppable({
    id
  })

  console.log('group', id, isOver)

  const answerTitle = query(element, 'dnd-answer-title')

  return (
    <div
      className={classNames('e-dnd-answer', {
        hovered: isOver
      })}
      data-question-id={id}
    >
      <b>
        Answer (id {id}) isOver: {isOver ? 'yes' : 'no'}
      </b>
      {answerTitle ? <DNDAnswerTitle element={answerTitle} renderChildNodes={renderChildNodes} /> : null}
      <SortableContext id={String(id)} items={groudIds} strategy={verticalListSortingStrategy}>
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
