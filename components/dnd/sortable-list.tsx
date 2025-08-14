"use client"

import React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"

interface SortableListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  children: (item: T, index: number) => React.ReactNode
  getItemId: (item: T) => string
  disabled?: boolean
  overlay?: (item: T | null) => React.ReactNode
}

export function SortableList<T>({
  items,
  onReorder,
  children,
  getItemId,
  disabled = false,
  overlay,
}: SortableListProps<T>) {
  const [activeItem, setActiveItem] = React.useState<T | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = items.find((item) => getItemId(item) === active.id)
    setActiveItem(item || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id)
      const newIndex = items.findIndex((item) => getItemId(item) === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
    }

    setActiveItem(null)
  }

  if (disabled) {
    return (
      <div>
        {items.map((item, index) => (
          <div key={getItemId(item)}>{children(item, index)}</div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext items={items.map(getItemId)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <div key={getItemId(item)}>{children(item, index)}</div>
        ))}
      </SortableContext>
      <DragOverlay>{activeItem && overlay ? overlay(activeItem) : activeItem && children(activeItem, -1)}</DragOverlay>
    </DndContext>
  )
}
