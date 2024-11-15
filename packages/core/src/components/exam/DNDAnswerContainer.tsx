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
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExamComponentProps } from '../..'
import { query, queryAll } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'
import { AnswersState } from '../../store/answers/reducer'
import { DNDTitleAndAnswerCommon } from '../shared/DNDTitleAndAnswerCommon'
import { DNDAnswer } from './DNDAnswer'
import { DNDAnswerOption } from './DNDAnswerOption'

type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>()
  const [items, setItems] = useState<ItemsState>({} as ItemsState)
  const [answerOptionsByOptionId, setAnswerOptionsByOptionId] = useState<Record<UniqueIdentifier, Element>>({})
  const [displayNumbersById, setDisplayNumbersById] = useState<Record<UniqueIdentifier, string>>({})
  const dispatch = useDispatch()

  const answers = useSelector((state: { answers: AnswersState }) => state.answers)

  useEffect(() => {
    console.log(element)
    const dndAnswers = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))
    const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

    const answerOptionIdsByQuestionId = dndAnswers.reduce(
      (acc, group) => {
        const questionId = group.getAttribute('question-id')!
        const answer = answers.answersById[Number(questionId)]?.value
        return {
          ...acc,
          [questionId]: answer ? [Number(answer)] : [],
          root: acc.root.filter(e => e !== Number(answer))
        }
      },
      { root: dndAnswerOptions.map(e => Number(e.getAttribute('option-id')!)) }
    )

    const answerOptionsByOptionId = dndAnswerOptions.reduce(
      (acc, el) => {
        const optionId = el.getAttribute('option-id')!
        return { ...acc, [optionId]: el }
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

    setItems(answerOptionIdsByQuestionId)
    setAnswerOptionsByOptionId(answerOptionsByOptionId)
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
  }

  useEffect(() => {
    Object.entries(items).forEach(([questionId, answerValue]) => {
      if (questionId !== 'root') {
        saveAnswerToStore(questionId, answerValue?.toString())
      }
    })
  }, [items])

  function saveAnswerToStore(overContainer: UniqueIdentifier, activeId: UniqueIdentifier) {
    const questionId = Number(overContainer)
    const value = activeId?.toString() || ''

    const displayNumber = displayNumbersById[questionId]
    dispatch(saveAnswer({ type: 'choice', questionId, value, displayNumber }))
  }

  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))

  // We can not render the prop 'element' (XML) here, because we will change the DOM structure when items are dragged around¯, but the XML can not be changed

  return (
    <div className="e-dnd-answer-container">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {dndAnswersWithQuestion.map(element => {
          const questionId = element.getAttribute('question-id')!

          return (
            <DNDTitleAndAnswerCommon
              key={questionId}
              element={element}
              renderChildNodes={renderChildNodes}
              items={items}
              answerOptionsByQuestionId={answerOptionsByOptionId}
              isInExam={true}
            />
          )
        })}

        <DNDAnswer
          renderChildNodes={renderChildNodes}
          questionId="root"
          items={items}
          answerOptionsByQuestionId={answerOptionsByOptionId}
        />

        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: 'ease-in-out'
          }}
          style={{
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            opacity: 0.85,
            cursor: 'grabbing'
          }}
        >
          {activeId ? (
            <DNDAnswerOption element={answerOptionsByOptionId[activeId]} renderChildNodes={renderChildNodes} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function moveValue(state: ItemsState, from: UniqueIdentifier, to: UniqueIdentifier, value: UniqueIdentifier) {
  const newState: ItemsState = { ...state }
  // Remove the value from its current container
  newState[from] = newState[from].filter(item => item !== value)

  if (to === 'root') {
    // add the value to root
    newState.root = [value, ...newState.root]
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
