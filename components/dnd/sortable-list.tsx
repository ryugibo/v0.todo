"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableListProps {
  id: string
  children: React.ReactNode
}

export function SortableList({ id, children }: SortableListProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative select-none">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1 rounded cursor-grab hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-none"
        title="리스트 순서 변경"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}
