"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, GripVertical } from "lucide-react"
import type { Todo } from "@/lib/types"

interface SortableTodoProps {
  todo: Todo
  onToggle: (completed: boolean) => void
  onDelete: () => void
}

export function SortableTodo({ todo, onToggle, onDelete }: SortableTodoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-accent/50 transition-colors select-none"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox checked={todo.completed} onCheckedChange={onToggle} />
      <span className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {todo.text}
      </span>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
