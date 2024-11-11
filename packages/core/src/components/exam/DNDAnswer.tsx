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
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { ExamComponentProps } from '../..'
import { getNumericAttribute, query, queryAll } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'
import { Score } from '../shared/Score'

type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
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
        {dndAnswersWithQuestion.map(element => {
          const id = element.getAttribute('question-id')!

          return (
            <DNDTitleAndAnswer
              key={id}
              element={element}
              renderChildNodes={renderChildNodes}
              items={items}
              answerOptionsByQuestionId={answerOptionsByQuestionId}
            />
          )
        })}

        <div className="e-font-size-xl e-color-link" role="separator">
          ✲✲✲
        </div>

        <DNDAnswer
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
            opacity: 0.85,
            cursor: 'grabbing'
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

const DNDTitleAndAnswer = ({
  element,
  renderChildNodes,
  items,
  answerOptionsByQuestionId
}: {
  element: Element
  renderChildNodes: ExamComponentProps['renderChildNodes']
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
}) => {
  const titleElement = query(element, 'dnd-answer-title')
  const maxScore = getNumericAttribute(element, 'max-score')
  const id = element.getAttribute('question-id')!

  return (
    <div
      className={classNames('e-dnd-answer', {
        //hovered: isOver,
        root: id === 'root'
      })}
      data-question-id={id}
      key={id}
    >
      <div className="title-and-line">
        {titleElement && <DNDAnswerTitle element={titleElement} renderChildNodes={renderChildNodes} />}
        <div className="connection-line" />
      </div>

      <DNDAnswer
        titleElement={titleElement}
        renderChildNodes={renderChildNodes}
        items={items}
        answerOptionsByQuestionId={answerOptionsByQuestionId}
        id={id}
      />
      {maxScore ? <Score score={maxScore} size="small" /> : null}
    </div>
  )
}

export const DNDAnswer = ({
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
  const { setNodeRef, isOver, active } = useDroppable({ id })

  const hasImages = dndAnswerOptions.some(option => query(option, 'image'))
  const hasAudio = dndAnswerOptions.some(option => query(option, 'audio'))
  const hasFormula = dndAnswerOptions.some(option => query(option, 'formula'))

  return (
    <SortableContext id={String(id)} items={idsInGroup}>
      <div
        ref={setNodeRef}
        className={classNames('e-dnd-answer-droppable', {
          hovered: isOver,
          'ready-for-drop': !!active?.id,
          'has-images': hasImages,
          'has-audio': hasAudio,
          'has-formula': hasFormula,
          root: id === 'root'
        })}
      >
        {dndAnswerOptions?.map((element, index) => {
          const optionId = element.getAttribute('option-id')!
          return (
            <DNDAnswerOption
              element={element}
              renderChildNodes={renderChildNodes}
              key={optionId + index}
              value={optionId}
            />
          )
        })}
      </div>
    </SortableContext>
  )
}

const DNDAnswerTitle = ({ element, renderChildNodes }: ExamComponentProps) => {
  const hasImages = !!query(element, 'image')
  return !renderChildNodes(element).length ? (
    <i>Tähän tulee kysymys...</i>
  ) : (
    <span
      className={classNames('e-dnd-answer-title', {
        'has-images': hasImages
      })}
    >
      {renderChildNodes(element)}
    </span>
  )
}

const DNDAnswerOption = ({
  element,
  renderChildNodes
}: ExamComponentProps & {
  value: UniqueIdentifier
}) => {
  const optionId = getNumericAttribute(element, 'option-id')!

  const { attributes, listeners, setNodeRef, isDragging, setActivatorNodeRef } = useDraggable({
    id: optionId
  })

  const style = {
    opacity: isDragging ? 0.3 : 1
  }

  const hasImages = !!query(element, 'image')
  const hasFormula = !!query(element, 'formula')

  return (
    <div ref={setNodeRef}>
      <div
        className={classNames('e-dnd-answer-option', {
          'has-images': hasImages,
          'has-formula': hasFormula
        })}
        style={style}
      >
        <div className="option-content">
          {!renderChildNodes(element).length ? <i>Tähän tulee vastaus...</i> : renderChildNodes(element)}
        </div>
        <div {...listeners} {...attributes} ref={setActivatorNodeRef} className="drag-handle">
          <i className="fa fa-up-down-left-right" />
        </div>
      </div>
    </div>
  )
}
