"use client"

import type React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

interface DraggableItemProps {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  data?: Record<string, any>
}

export function DraggableItem({ id, children, className, disabled = false, data }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
    data,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing select-none touch-none",
        isDragging && "z-50 opacity-50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
