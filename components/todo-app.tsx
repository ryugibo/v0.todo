"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Loader2, Edit2, MoreVertical, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { SortableItem } from "@/components/dnd/sortable-item"
import { DroppableArea } from "@/components/dnd/droppable-area"
import { DraggableItem } from "@/components/dnd/draggable-item"
import { listOperations } from "@/lib/list-operations"
import { todoOperations } from "@/lib/todo-operations"
import type { TodoList, Todo } from "@/lib/types"

export default function TodoApp() {
  const [lists, setLists] = useState<TodoList[]>([])
  const [todosByList, setTodosByList] = useState<Record<string, Todo[]>>({})
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState("")
  const [editingList, setEditingList] = useState<{ id: string; name: string } | null>(null)
  const [newTodoInputs, setNewTodoInputs] = useState<Record<string, string>>({})
  const [addingTodos, setAddingTodos] = useState<Record<string, boolean>>({})
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false)
  const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<{ type: "todo" | "list"; item: Todo | TodoList } | null>(null)
  const [schemaError, setSchemaError] = useState<string | null>(null)

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setSchemaError(null)

      const defaultList = await listOperations.ensureDefaultList()

      const [listsData, todosData] = await Promise.all([listOperations.getLists(), listOperations.getAllTodos()])

      const finalLists = listsData.length > 0 ? listsData : [defaultList]

      setLists(finalLists)
      setTodosByList(todosData)
    } catch (error) {
      console.error("Error loading data:", error)
      if (error instanceof Error && error.message.includes("column")) {
        setSchemaError(
          "데이터베이스 스키마를 업데이트해야 합니다. 프로젝트 설정에서 마이그레이션 스크립트를 실행해주세요.",
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string

    // Check if it's a todo
    const todo = Object.values(todosByList)
      .flat()
      .find((t) => t.id === activeId)
    if (todo) {
      setActiveItem({ type: "todo", item: todo })
      return
    }

    // Check if it's a list
    const list = lists.find((l) => l.id === activeId)
    if (list) {
      setActiveItem({ type: "list", item: list })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !activeItem) return

    const activeId = active.id as string
    const overId = over.id as string

    // Only handle todo drag over list for visual feedback
    if (activeItem.type === "todo") {
      const sourceListId = (activeItem.item as Todo).list_id || "default"
      const targetListId = lists.find((l) => l.id === overId)?.id

      // Only provide visual feedback, don't actually move the item yet
      if (targetListId && sourceListId !== targetListId) {
        // Visual feedback will be handled by DragOverlay
        return
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over || !activeItem) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeItem.type === "list") {
      // Handle list reordering
      if (activeId !== overId) {
        const oldIndex = lists.findIndex((list) => list.id === activeId)
        const newIndex = lists.findIndex((list) => list.id === overId)
        const newLists = arrayMove(lists, oldIndex, newIndex)

        setLists(newLists)
        try {
          await listOperations.reorderLists(newLists)
        } catch (error) {
          console.error("Error reordering lists:", error)
          loadData() // Restore on error
        }
      }
    } else if (activeItem.type === "todo") {
      const todo = activeItem.item as Todo
      const sourceListId = todo.list_id || "default"

      // Check if dropped on a list (different from source)
      const targetList = lists.find((l) => l.id === overId)
      if (targetList && targetList.id !== sourceListId) {
        // Move todo to different list
        try {
          const targetTodos = todosByList[targetList.id] || []
          await todoOperations.moveTodo(todo.id, targetList.id, targetTodos.length)

          // Reload data to ensure consistency
          await loadData()
        } catch (error) {
          console.error("Error moving todo:", error)
          await loadData() // Restore on error
        }
      } else {
        // Handle reordering within the same list
        const targetTodo = Object.values(todosByList)
          .flat()
          .find((t) => t.id === overId)
        if (targetTodo && (targetTodo.list_id || "default") === sourceListId && activeId !== overId) {
          const listTodos = todosByList[sourceListId] || []
          const oldIndex = listTodos.findIndex((t) => t.id === activeId)
          const newIndex = listTodos.findIndex((t) => t.id === overId)

          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedTodos = arrayMove(listTodos, oldIndex, newIndex)

            setTodosByList({
              ...todosByList,
              [sourceListId]: reorderedTodos,
            })

            try {
              await todoOperations.reorderTodos(reorderedTodos)
            } catch (error) {
              console.error("Error reordering todos:", error)
              await loadData() // Restore on error
            }
          }
        }
      }
    }
  }

  const handleCreateList = async () => {
    if (newListName.trim() === "") return

    try {
      const newList = await listOperations.createList(newListName)
      setLists([...lists, newList])
      setTodosByList({ ...todosByList, [newList.id]: [] })
      setNewListName("")
      setIsAddListDialogOpen(false)
    } catch (error) {
      console.error("Error creating list:", error)
    }
  }

  const handleUpdateList = async () => {
    if (!editingList || editingList.name.trim() === "") return

    try {
      const updatedList = await listOperations.updateList(editingList.id, editingList.name)
      setLists(lists.map((list) => (list.id === updatedList.id ? updatedList : list)))
      setEditingList(null)
      setIsEditListDialogOpen(false)
    } catch (error) {
      console.error("Error updating list:", error)
    }
  }

  const handleDeleteList = async (listId: string) => {
    try {
      await listOperations.deleteList(listId)
      setLists(lists.filter((list) => list.id !== listId))
      const newTodosByList = { ...todosByList }
      delete newTodosByList[listId]
      setTodosByList(newTodosByList)
    } catch (error) {
      console.error("Error deleting list:", error)
    }
  }

  const handleAddTodo = async (listId: string) => {
    const inputValue = newTodoInputs[listId] || ""
    if (inputValue.trim() === "" || addingTodos[listId]) return

    setAddingTodos({ ...addingTodos, [listId]: true })
    try {
      const newTodo = await todoOperations.createTodo(inputValue, listId)
      setTodosByList({
        ...todosByList,
        [listId]: [...(todosByList[listId] || []), newTodo],
      })
      setNewTodoInputs({ ...newTodoInputs, [listId]: "" })
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setAddingTodos({ ...addingTodos, [listId]: false })
    }
  }

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const updatedTodo = await todoOperations.toggleTodo(todoId, completed)
      const newTodosByList = { ...todosByList }
      Object.keys(newTodosByList).forEach((listId) => {
        newTodosByList[listId] = newTodosByList[listId].map((todo) => (todo.id === todoId ? updatedTodo : todo))
      })
      setTodosByList(newTodosByList)
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const handleDeleteTodo = async (todoId: string, listId: string) => {
    try {
      await todoOperations.deleteTodo(todoId)
      setTodosByList({
        ...todosByList,
        [listId]: todosByList[listId].filter((todo) => todo.id !== todoId),
      })
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, listId: string) => {
    if (e.key === "Enter") {
      handleAddTodo(listId)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>할일 목록을 불러오는 중...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (schemaError) {
    return (
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-destructive">
            <CardContent className="text-center py-8">
              <div className="text-destructive mb-4">
                <h2 className="text-lg font-semibold mb-2">데이터베이스 업데이트 필요</h2>
                <p className="text-sm">{schemaError}</p>
              </div>
              <Button onClick={loadData} variant="outline">
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">나의 할일 목록</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {lists.length}개의 리스트 • 총 {Object.values(todosByList).flat().length}개의 할일
              </p>
            </div>
            <Dialog open={isAddListDialogOpen} onOpenChange={setIsAddListDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />새 리스트
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 리스트 만들기</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="리스트 이름을 입력하세요..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateList()}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddListDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateList} disabled={newListName.trim() === ""}>
                      만들기
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {lists.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">아직 리스트가 없습니다.</p>
                <Button onClick={() => setIsAddListDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />첫 번째 리스트 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <SortableContext items={lists.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <SortableItem key={list.id} id={list.id} className="h-full">
                    <DroppableArea id={list.id} className="h-full" data={{ type: "list", listId: list.id }}>
                      <Card className="shadow-lg h-full flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <CardTitle className="text-lg font-semibold">{list.name}</CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingList({ id: list.id, name: list.name })
                                    setIsEditListDialogOpen(true)
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  수정
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteList(list.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {todosByList[list.id]?.filter((todo) => todo.completed).length || 0}/
                            {todosByList[list.id]?.length || 0} 완료
                          </p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="새로운 할일..."
                              value={newTodoInputs[list.id] || ""}
                              onChange={(e) => setNewTodoInputs({ ...newTodoInputs, [list.id]: e.target.value })}
                              onKeyPress={(e) => handleKeyPress(e, list.id)}
                              className="flex-1"
                              disabled={addingTodos[list.id]}
                            />
                            <Button onClick={() => handleAddTodo(list.id)} size="icon" disabled={addingTodos[list.id]}>
                              {addingTodos[list.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          <div className="flex-1 space-y-2 min-h-[200px]">
                            {!todosByList[list.id] || todosByList[list.id].length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                                <p className="text-sm">할일을 여기로 드래그하거나</p>
                                <p className="text-sm">위에서 새로운 할일을 추가하세요</p>
                              </div>
                            ) : (
                              <SortableContext
                                items={todosByList[list.id].map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {todosByList[list.id].map((todo) => (
                                  <DraggableItem
                                    key={todo.id}
                                    id={todo.id}
                                    data={{ type: "todo", todo, listId: list.id }}
                                  >
                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-grab active:cursor-grabbing">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      <Checkbox
                                        checked={todo.completed}
                                        onCheckedChange={() => handleToggleTodo(todo.id, !todo.completed)}
                                      />
                                      <span
                                        className={`flex-1 ${
                                          todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                                        }`}
                                      >
                                        {todo.text}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteTodo(todo.id, list.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </DraggableItem>
                                ))}
                              </SortableContext>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DroppableArea>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          )}

          <Dialog open={isEditListDialogOpen} onOpenChange={setIsEditListDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>리스트 수정</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="리스트 이름을 입력하세요..."
                  value={editingList?.name || ""}
                  onChange={(e) => setEditingList(editingList ? { ...editingList, name: e.target.value } : null)}
                  onKeyPress={(e) => e.key === "Enter" && handleUpdateList()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditListDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleUpdateList} disabled={!editingList?.name.trim()}>
                    수정
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DragOverlay>
        {activeItem && activeItem.type === "todo" ? (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-lg opacity-90">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Checkbox checked={(activeItem.item as Todo).completed} disabled />
            <span className="flex-1 text-foreground">{(activeItem.item as Todo).text}</span>
          </div>
        ) : activeItem && activeItem.type === "list" ? (
          <Card className="shadow-lg opacity-90 w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">{(activeItem.item as TodoList).name}</CardTitle>
            </CardHeader>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
