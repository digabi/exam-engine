import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  rectIntersection,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  arrayMove,
  defaultAnimateLayoutChanges,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { ForwardedRef, forwardRef, useState } from 'react'

type Items = Record<UniqueIdentifier, ContainerContents[]>

type ContainerContents = {
  id: UniqueIdentifier
  value: React.ReactNode
}

export function DragAndDrop() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState<Items>({
    a: [
      {
        id: 1,
        value: <span>moi</span>
      },
      {
        id: 2,
        value: (
          <img src="https://its-finland.fi/wp-content/uploads/2023/06/ytl-toimiliitto-1-uai-780x438-1.jpg" width="50" />
        )
      }
    ],
    b: [
      {
        id: 3,
        value: <span>hej</span>
      },
      {
        id: 4,
        value: <span>hello</span>
      }
    ]
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const findContainerId = (id: UniqueIdentifier) => {
    if (id in items) {
      return id
    }
    return Object.keys(items).find(key => items[key].flatMap(i => i.id).includes(id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '1rem'
        }}
      >
        {Object.keys(items).map((containerId, index) => (
          <DroppableContainer
            key={containerId}
            //containerId={containerId}
            //index={index}
            id={containerId}
            items={items[containerId]}
          >
            <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy} key={containerId}>
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: '.5rem',
                  padding: '1rem',
                  background: index === 0 ? '#ffa' : '#faf',
                  minWidth: '200px',
                  minHeight: '100px'
                }}
              >
                {items[containerId].map(item => (
                  <SortableItem key={item.id} id={item.id} active={activeId === item.id.toString()}>
                    {item.value}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DroppableContainer>
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <Item id={activeId}>
            {
              Object.values(items)
                .flat()
                .find(i => i.id.toString() === activeId)?.value
            }
          </Item>
        ) : (
          'null'
        )}
      </DragOverlay>
    </DndContext>
  )

  function handleDragOver(event: DragOverEvent) {
    const { over, active } = event
    const overId = over?.id

    console.log('over', over)

    if (overId == null || active.id in items) {
      return
    }

    const overContainer = findContainerId(overId)
    const activeContainer = findContainerId(active.id)

    if (!overContainer || !activeContainer) {
      return
    }

    if (activeContainer !== overContainer) {
      setItems(items => {
        const activeItems = items[activeContainer].flatMap(item => item.id)
        const overItems = items[overContainer].flatMap(item => item.id)
        const activeIndex = activeItems.indexOf(active.id)
        const overIndex = overItems.indexOf(overId)

        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0
        const newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1

        const newActiveItems = items[activeContainer].filter(item => item.id !== active.id)
        const newOverItems = [
          ...items[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...items[overContainer].slice(newIndex, items[overContainer].length)
        ]

        return {
          ...items,
          [activeContainer]: newActiveItems,
          [overContainer]: newOverItems
        }
      })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    console.log('end', event)
    const { active, over } = event

    const activeContainer = findContainerId(active.id)
    if (!activeContainer) {
      setActiveId(null)
      return
    }

    const overId = over?.id
    if (overId == null) {
      setActiveId(null)
      return
    }

    const overContainer = findContainerId(overId)

    if (overContainer) {
      const activeIndex = items[activeContainer].flatMap(i => i.id).indexOf(active.id)
      const overIndex = items[overContainer].flatMap(i => i.id).indexOf(overId)

      if (activeIndex !== overIndex) {
        setItems(items => ({
          ...items,
          [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
        }))
      }
    }

    setActiveId(null)
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    console.log('START', active.id)
    setActiveId(active.id.toString())
  }
}

function SortableItem({ id, active, children }: { id: UniqueIdentifier; active: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: active ? 0.5 : 1,
    transition
  }

  return (
    <div style={style}>
      <Item ref={setNodeRef} {...attributes} {...listeners} id={id}>
        {children}
      </Item>
    </div>
  )
}

const Item = forwardRef(
  (
    { id, children, ...props }: { id: UniqueIdentifier; children: React.ReactNode },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const style = {
      border: '1px solid black',
      padding: '.5rem',
      display: 'inline-block',
      background: 'pink',
      minWidth: '100px'
    }
    //console.log('item children', children)
    return (
      <div {...props} ref={ref} style={style}>
        {children} {id}
      </div>
    )
  }
)

Item.displayName = 'Item'

const animateLayoutChanges: AnimateLayoutChanges = args => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

function DroppableContainer({
  children,
  id,
  items,
  ...props
}: {
  disabled?: boolean
  id: UniqueIdentifier
  items: ContainerContents[]
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const { isDragging, setNodeRef, transition, transform, over } = useSortable({
    id,
    data: {
      type: 'container',
      children: items
    },
    animateLayoutChanges
  })

  console.log('droppable, over', over)
  /*
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
    : false
    */

  return (
    <div
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
        display: 'inline-block'
      }}
      //hover={isOverContainer}
      {...props}
    >
      {children}
    </div>
  )
}
