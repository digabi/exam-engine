import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, query, queryAll } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'

type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>()
  const [items, setItems] = useState<ItemsState>({} as ItemsState)
  const [answerOptionsByQuestionId, setAnswerOptionsByQuestionId] = useState<Record<UniqueIdentifier, Element>>({})
  const [displayNumbersById, setDisplayNumbersById] = useState<Record<UniqueIdentifier, string>>({})
  const dispatch = useDispatch()

  useEffect(() => {
    console.log(element)
    const dndAnswers = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))
    const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

    const answerOptionIdsByGroupId = dndAnswers.reduce(
      (acc, group) => {
        const questionId = group.getAttribute('question-id')!
        return { ...acc, [questionId]: [] }
      },
      { root: dndAnswerOptions.map(e => Number(e.getAttribute('option-id')!)) }
    )

    const answerOptionsByQuestionId = dndAnswerOptions.reduce(
      (acc, el) => {
        const questionId = el.getAttribute('option-id')!
        return { ...acc, [questionId]: el }
      },
      {} as Record<UniqueIdentifier, Element>
    )

    const displayNumbersById = dndAnswers.reduce(
      (acc, el) => {
        const questionId = el.getAttribute('question-id')!
        const displayNumber = el.getAttribute('display-number')!
        return { ...acc, [questionId]: displayNumber }
      },
      {} as Record<UniqueIdentifier, string>
    )

    setItems(answerOptionIdsByGroupId)
    setAnswerOptionsByQuestionId(answerOptionsByQuestionId)
    setDisplayNumbersById(displayNumbersById)
  }, [element])

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
    document.body.style.cursor = 'grabbing'
    setActiveId(event.active.id)
  }

  function getContainers(event: DragOverEvent | DragEndEvent) {
    const { active, over } = event
    const activeId = active.id
    const overId = over?.id

    const activeContainer = findContainer(activeId)
    const overContainer = overId ? findContainer(overId) : null

    return { activeId, activeContainer, overContainer }
  }

  function handleDragOver(event: DragOverEvent) {
    const { activeContainer, overContainer } = getContainers(event)
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { activeId, activeContainer, overContainer } = getContainers(event)
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }
    setItems(items => moveValue(items, activeContainer, overContainer, activeId))
    setActiveId(null)
    document.body.style.cursor = ''

    if (overContainer !== 'root') {
      saveAnswerToStore(overContainer, activeId)
    }
  }

  function saveAnswerToStore(overContainer: UniqueIdentifier, activeId: UniqueIdentifier) {
    const questionId = Number(overContainer)
    const value = activeId.toString()
    const displayNumber = displayNumbersById[questionId]
    dispatch(saveAnswer({ type: 'drag-and-drop', questionId, value, displayNumber }))
  }

  function moveValue(state: ItemsState, from: UniqueIdentifier, to: UniqueIdentifier, value: UniqueIdentifier) {
    const newState: ItemsState = { ...state }
    // Remove the value from its current container
    newState[from] = newState[from].filter(item => item !== value)

    if (to === 'root') {
      // add the value to root
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

  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))

  // We can not render the prop 'element' (XML) here, because we will change the DOM structure when we move items, but the XML can not be changed

  return (
    <div className="e-dnd-answer-container">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {dndAnswersWithQuestion.map((element, index) => {
          const titleElement = query(element, 'dnd-answer-title')
          return (
            <DNDAnswerGroup
              titleElement={titleElement}
              renderChildNodes={renderChildNodes}
              key={index}
              items={items}
              answerOptionsByQuestionId={answerOptionsByQuestionId}
              id={element.getAttribute('question-id')!}
            />
          )
        })}
        <hr />
        <DNDAnswerGroup
          renderChildNodes={renderChildNodes}
          id="root"
          items={items}
          answerOptionsByQuestionId={answerOptionsByQuestionId}
        />

        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: 'ease-in-out'
          }}
          style={{
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            //display: 'inline-block',
            opacity: 0.7
          }}
        >
          {activeId ? (
            <DNDAnswerOption
              element={answerOptionsByQuestionId[activeId]}
              renderChildNodes={renderChildNodes}
              value={activeId}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export const DNDAnswerGroup = ({
  titleElement,
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  id
}: {
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  id: UniqueIdentifier
  titleElement?: Element
  renderChildNodes: ExamComponentProps['renderChildNodes']
}) => {
  const idsInGroup = items[id] || []
  const dndAnswerOptions = idsInGroup.map(id => answerOptionsByQuestionId[id])
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      className={classNames('e-dnd-answer', {
        hovered: isOver,
        root: id === 'root'
      })}
      data-question-id={id}
    >
      <div>
        {titleElement && <DNDAnswerTitle element={titleElement} renderChildNodes={renderChildNodes} />}
        {id === 'root' && <div>Tässä on kaikki vaihtoehdot</div>}
      </div>

      <SortableContext id={String(id)} items={idsInGroup} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={classNames('e-dnd-answer-droppable', {
            hovered: isOver
          })}
        >
          {dndAnswerOptions?.map(element => {
            const optionId = element.getAttribute('option-id')!
            return (
              <DNDAnswerOption element={element} renderChildNodes={renderChildNodes} key={optionId} value={optionId} />
            )
          })}
        </div>
      </SortableContext>
    </div>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => (
  <span className="e-dnd-answer-title">{renderChildNodes(element)}</span>
)

const DNDAnswerOption = ({
  element,
  renderChildNodes
}: ExamComponentProps & {
  value: UniqueIdentifier
}) => {
  const optionId = getNumericAttribute(element, 'option-id')!

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: optionId
  })

  const style = {
    display: 'inline-block',
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab'
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="e-dnd-answer-option">
        {renderChildNodes(element)}
        <i className="fa fa-up-down-left-right" />
      </div>
    </div>
  )
}
