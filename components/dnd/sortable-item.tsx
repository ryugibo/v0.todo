"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  handle?: boolean
}

export function SortableItem({ id, children, className, disabled = false, handle = true }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "z-50 opacity-50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...attributes}
    >
      {handle && !disabled && (
        <div
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-70 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className={cn(handle && !disabled && "pl-8")}>{children}</div>
    </div>
  )
}
