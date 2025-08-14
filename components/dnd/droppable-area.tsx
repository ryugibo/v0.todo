"use client"

import type React from "react"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableAreaProps {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  data?: Record<string, any>
}

export function DroppableArea({ id, children, className, disabled = false, data }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
    data,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors",
        isOver && !disabled && "bg-accent/50 ring-2 ring-primary/20",
        disabled && "opacity-50",
        className,
      )}
    >
      {children}
    </div>
  )
}
