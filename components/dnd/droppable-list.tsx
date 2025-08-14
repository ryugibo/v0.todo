import { useDroppable } from "@dnd-kit/core"
import type { ReactNode } from "react"

interface DroppableListProps {
  listId: string
  children: ReactNode
}

export function DroppableList({ listId, children }: DroppableListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: listId,
  })

  return (
    <div ref={setNodeRef} className={`transition-colors ${isOver ? "ring-2 ring-primary ring-opacity-50" : ""}`}>
      {children}
    </div>
  )
}
