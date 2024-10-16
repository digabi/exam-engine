import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import React, { useState } from 'react'

export function DragAndDrop() {
  const [itemsInContainers, setItemsInContainers] = useState<{
    containers: {
      id: string
      items: {
        id: string
      }[]
    }[]
  }>({
    containers: [
      {
        id: 'droppable1',
        items: []
      },
      {
        id: 'droppable2',
        items: []
      }
    ]
  })

  function handleDragEnd(event: DragEndEvent) {
    if (event.over) {
      setItemsInContainers(prev => {
        const newContainers = prev.containers.map(container => {
          if (container.id === event.over?.id.toString()) {
            // Add item to new container
            return { ...container, items: [...container.items, { id: event.active.id.toString() }] }
          } else {
            // Remove item from original container
            return {
              ...container,
              items: container.items.filter(item => item.id !== event.active.id.toString())
            }
          }
        })
        return { ...prev, containers: newContainers }
      })
    } else {
      // If dropped outside any container, remove from original container
      setItemsInContainers(prev => {
        const newContainers = prev.containers.map(container => ({
          ...container,
          items: container.items.filter(item => item.id !== event.active.id.toString())
        }))
        return { ...prev, containers: newContainers }
      })
    }
  }

  const draggableItems = [
    { id: 'draggable1', content: 'Answer 1' },
    { id: 'draggable2', content: 'Answer 2' }
  ]

  const itemIsNotInAnyContainer = (itemId: string) =>
    itemsInContainers.containers.every(container => container.items.every(item => item.id !== itemId))

  const itemIsInContainer = (itemId: string, containerId: string) =>
    itemsInContainers.containers.some(
      container => container.id === containerId && container.items.some(item => item.id === itemId)
    )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {draggableItems.map(item =>
        itemIsNotInAnyContainer(item.id) ? (
          <Draggable key={item.id} id={item.id}>
            {item.content}
          </Draggable>
        ) : null
      )}
      <br />
      {itemsInContainers.containers.map(container => (
        <Droppable key={container.id} id={container.id}>
          Drop answers here...
          {draggableItems.map(item =>
            itemIsInContainer(item.id, container.id) ? (
              <Draggable key={item.id} id={item.id}>
                {item.content}
              </Draggable>
            ) : null
          )}
        </Droppable>
      ))}
    </DndContext>
  )
}

function Droppable(props: { children: React.ReactNode; id: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id
  })
  const style = {
    color: isOver ? 'green' : undefined,
    backgroundColor: isOver ? '#fc06' : undefined,
    padding: '1rem',
    border: '1px solid black',
    display: 'inline-flex',
    gap: '.25rem',
    flexDirection: 'column' as const
  }

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  )
}

function Draggable(props: { children: React.ReactNode; id: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id
  })
  const style = {
    padding: '.5rem',
    border: '1px solid black',
    backgroundColor: '#acf',
    display: 'inline-block',
    ...(transform
      ? {
          transform: CSS.Translate.toString(transform)
        }
      : undefined)
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  )
}
