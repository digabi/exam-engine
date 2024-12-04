import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
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
import { DNDTitleAndDroppable } from '../shared/DNDTitleAndDroppable'
import { AllDNDOptions } from './DNDAllOptions'
import { DNDAnswerOptionDraggable } from './DNDAnswerOptionDraggable'

export type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>()
  const [optionIdsByQuestionId, setOptionIdsByQuestionId] = useState<ItemsState>({} as ItemsState)
  const [answerOptionsById, setAnswerOptionsById] = useState<Record<UniqueIdentifier, Element>>({})
  const [displayNumbersById, setDisplayNumbersById] = useState<Record<UniqueIdentifier, string>>({})
  const dispatch = useDispatch()

  const answers = useSelector((state: { answers: AnswersState }) => state.answers)

  useEffect(() => {
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

    const answerOptionsByOptionId: Record<UniqueIdentifier, Element> = dndAnswerOptions.reduce((acc, el) => {
      const optionId = el.getAttribute('option-id')!
      return { ...acc, [optionId]: el }
    }, {})

    const displayNumbersById: Record<UniqueIdentifier, string> = dndAnswers.reduce((acc, el) => {
      const questionId = el.getAttribute('question-id')!
      const displayNumber = el.getAttribute('display-number')!
      return { ...acc, [questionId]: displayNumber }
    }, {})

    setOptionIdsByQuestionId(answerOptionIdsByQuestionId)
    setAnswerOptionsById(answerOptionsByOptionId)
    setDisplayNumbersById(displayNumbersById)
  }, [element])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function findContainer(id: UniqueIdentifier) {
    if (id in optionIdsByQuestionId) {
      return id
    }
    return Object.keys(optionIdsByQuestionId).find(key => optionIdsByQuestionId[key].includes(id))
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
    setOptionIdsByQuestionId(optionIdsByQuestionId =>
      moveValue(optionIdsByQuestionId, activeContainer, overContainer, activeId)
    )
    setActiveId(null)
  }

  useEffect(() => {
    Object.entries(optionIdsByQuestionId).forEach(([questionId, answerValue]) => {
      if (questionId !== 'root') {
        saveAnswerToStore(questionId, answerValue?.toString())
      }
    })
  }, [optionIdsByQuestionId])

  function saveAnswerToStore(overContainer: UniqueIdentifier, activeId: UniqueIdentifier) {
    const questionId = Number(overContainer)
    const value = activeId?.toString() || ''
    const displayNumber = displayNumbersById[questionId]
    dispatch(saveAnswer({ type: 'choice', questionId, value, displayNumber }))
  }

  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))

  const allAnswerOptionElements = optionIdsByQuestionId.root?.map(id => answerOptionsById[id] || null).filter(Boolean)

  // We can not render the prop 'element' (XML) here, because we will change the DOM structure when items are dragged around¯, but the XML can not be changed

  return (
    <div className="e-dnd-answer-container">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        {dndAnswersWithQuestion.map(element => {
          const questionId = element.getAttribute('question-id')!
          const dndAnswerOptions = (optionIdsByQuestionId[questionId] || [])
            ?.map(id => answerOptionsById?.[id] || null)
            .filter(Boolean)
          const itemIds = optionIdsByQuestionId[questionId] || []

          return (
            <DNDTitleAndDroppable
              key={questionId}
              element={element}
              renderChildNodes={renderChildNodes}
              itemIds={itemIds}
              answerOptionElements={dndAnswerOptions}
              page="exam"
            />
          )
        })}

        <AllDNDOptions
          items={optionIdsByQuestionId.root || []}
          renderChildNodes={renderChildNodes}
          answerOptionElements={allAnswerOptionElements}
        />

        <DragOverlay
          className="e-dnd-answer-drag-overlay"
          dropAnimation={{
            duration: 250,
            easing: 'ease-in-out'
          }}
        >
          {activeId ? (
            <DNDAnswerOptionDraggable element={answerOptionsById[activeId]} renderChildNodes={renderChildNodes} />
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
