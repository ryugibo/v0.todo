"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Loader2, Edit2, Check, X, GripVertical } from "lucide-react"
import { listOperations } from "@/lib/list-operations"
import { todoOperations } from "@/lib/todo-operations"
import type { TodoList, Todo } from "@/lib/types"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableTodo } from "@/components/dnd/sortable-todo"
import { DroppableList } from "@/components/dnd/droppable-list"

export default function TodoApp() {
  const [lists, setLists] = useState<TodoList[]>([])
  const [todosByList, setTodosByList] = useState<Record<string, Todo[]>>({})
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState("")
  const [addingList, setAddingList] = useState(false)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListName, setEditingListName] = useState("")
  const [newTodoTexts, setNewTodoTexts] = useState<Record<string, string>>({})
  const [addingTodos, setAddingTodos] = useState<Record<string, boolean>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [listsData, todosData] = await Promise.all([listOperations.getLists(), listOperations.getAllTodos()])

      setLists(listsData)
      setTodosByList(todosData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddList = async () => {
    if (newListName.trim() === "" || addingList) return

    setAddingList(true)
    try {
      const newList = await listOperations.createList(newListName.trim())
      setLists([...lists, newList])
      setTodosByList({ ...todosByList, [newList.id]: [] })
      setNewListName("")
    } catch (error) {
      console.error("Error adding list:", error)
    } finally {
      setAddingList(false)
    }
  }

  const handleEditList = (listId: string, currentName: string) => {
    setEditingListId(listId)
    setEditingListName(currentName)
  }

  const handleSaveListEdit = async () => {
    if (!editingListId || editingListName.trim() === "") return

    try {
      const updatedList = await listOperations.updateList(editingListId, editingListName.trim())
      setLists(lists.map((list) => (list.id === editingListId ? updatedList : list)))
      setEditingListId(null)
      setEditingListName("")
    } catch (error) {
      console.error("Error updating list:", error)
    }
  }

  const handleCancelListEdit = () => {
    setEditingListId(null)
    setEditingListName("")
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("이 리스트와 모든 할일을 삭제하시겠습니까?")) return

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
    const todoText = newTodoTexts[listId]
    if (!todoText?.trim() || addingTodos[listId]) return

    setAddingTodos({ ...addingTodos, [listId]: true })
    try {
      const newTodo = await todoOperations.createTodo(todoText.trim(), listId)
      setTodosByList({
        ...todosByList,
        [listId]: [newTodo, ...(todosByList[listId] || [])],
      })
      setNewTodoTexts({ ...newTodoTexts, [listId]: "" })
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setAddingTodos({ ...addingTodos, [listId]: false })
    }
  }

  const handleToggleTodo = async (todoId: string, completed: boolean, listId: string) => {
    try {
      const updatedTodo = await todoOperations.toggleTodo(todoId, completed)
      setTodosByList({
        ...todosByList,
        [listId]: todosByList[listId].map((todo) => (todo.id === todoId ? updatedTodo : todo)),
      })
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

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
    }
  }

  const getTotalStats = () => {
    let totalTodos = 0
    let completedTodos = 0

    Object.values(todosByList).forEach((todos) => {
      totalTodos += todos.length
      completedTodos += todos.filter((todo) => todo.completed).length
    })

    return { totalTodos, completedTodos }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    for (const listId in todosByList) {
      const todo = todosByList[listId].find((t) => t.id === active.id)
      if (todo) {
        setActiveTodo(todo)
        break
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // 시각적 피드백만 제공하고 실제 상태는 변경하지 않음
    // DragOverlay가 시각적 피드백을 처리함
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveTodo(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    let sourceListId = ""
    let destinationListId = ""

    // 소스 리스트 찾기
    for (const listId in todosByList) {
      if (todosByList[listId].some((todo) => todo.id === activeId)) {
        sourceListId = listId
        break
      }
    }

    // 목적지 리스트 찾기
    if (lists.some((list) => list.id === overId)) {
      // 리스트 자체에 드롭한 경우
      destinationListId = overId
    } else {
      // 다른 투두 위에 드롭한 경우
      for (const listId in todosByList) {
        if (todosByList[listId].some((todo) => todo.id === overId)) {
          destinationListId = listId
          break
        }
      }
    }

    if (!sourceListId || !destinationListId) return

    try {
      if (sourceListId !== destinationListId) {
        // 다른 리스트로 이동
        const destinationTodos = todosByList[destinationListId] || []
        const newOrderIndex = destinationTodos.length // 맨 뒤에 추가

        await todoOperations.moveTodo(activeId, destinationListId, newOrderIndex)
      } else {
        // 같은 리스트 내에서 순서 변경
        const todos = todosByList[sourceListId]
        const oldIndex = todos.findIndex((todo) => todo.id === activeId)
        const newIndex = todos.findIndex((todo) => todo.id === overId)

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          const reorderedTodos = [...todos]
          const [removed] = reorderedTodos.splice(oldIndex, 1)
          reorderedTodos.splice(newIndex, 0, removed)

          await todoOperations.reorderTodos(reorderedTodos)
        }
      }

      // 데이터 다시 로드하여 일관성 보장
      await loadData()
    } catch (error) {
      console.error("Error handling drag end:", error)
      // 에러 발생 시 데이터 다시 로드
      await loadData()
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
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

  const { totalTodos, completedTodos } = getTotalStats()

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">나의 할일 목록</h1>
          <p className="text-sm text-muted-foreground">
            전체 {completedTodos}/{totalTodos} 완료 • {lists.length}개 리스트
          </p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>새로운 리스트 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="새로운 리스트 이름을 입력하세요..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddList)}
                className="flex-1"
                disabled={addingList}
              />
              <Button onClick={handleAddList} disabled={addingList || newListName.trim() === ""}>
                {addingList ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {lists.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-8 text-muted-foreground">
              <p>아직 리스트가 없습니다.</p>
              <p className="text-sm mt-1">위에서 새로운 리스트를 추가해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => {
                const listTodos = todosByList[list.id] || []
                const completedCount = listTodos.filter((todo) => todo.completed).length

                return (
                  <DroppableList key={list.id} listId={list.id}>
                    <Card className="shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          {editingListId === list.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingListName}
                                onChange={(e) => setEditingListName(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, handleSaveListEdit)}
                                className="flex-1"
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" onClick={handleSaveListEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={handleCancelListEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <CardTitle className="text-lg">{list.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {completedCount}/{listTodos.length} 완료
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => handleEditList(list.id, list.name)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteList(list.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          <Input
                            placeholder="새로운 할일..."
                            value={newTodoTexts[list.id] || ""}
                            onChange={(e) => setNewTodoTexts({ ...newTodoTexts, [list.id]: e.target.value })}
                            onKeyPress={(e) => handleKeyPress(e, () => handleAddTodo(list.id))}
                            className="flex-1"
                            disabled={addingTodos[list.id]}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleAddTodo(list.id)}
                            disabled={addingTodos[list.id] || !newTodoTexts[list.id]?.trim()}
                          >
                            {addingTodos[list.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {listTodos.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground text-sm">할일이 없습니다</div>
                        ) : (
                          <SortableContext
                            items={listTodos.map((todo) => todo.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {listTodos.map((todo) => (
                                <SortableTodo
                                  key={todo.id}
                                  todo={todo}
                                  onToggle={(completed) => handleToggleTodo(todo.id, completed, list.id)}
                                  onDelete={() => handleDeleteTodo(todo.id, list.id)}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        )}
                      </CardContent>
                    </Card>
                  </DroppableList>
                )
              })}
            </div>
            <DragOverlay>
              {activeTodo ? (
                <div className="flex items-center gap-2 p-2 rounded border bg-card shadow-lg opacity-90">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Checkbox checked={activeTodo.completed} />
                  <span
                    className={`flex-1 text-sm ${
                      activeTodo.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {activeTodo.text}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
