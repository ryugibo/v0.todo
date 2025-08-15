"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { listOperations } from "@/lib/list-operations"
import { todoOperations } from "@/lib/todo-operations"
import type { TodoList, Todo } from "@/lib/types"

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

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
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
          <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-100 mb-2">🎮 GameTodo</h1>
          <p className="text-sm text-muted-foreground">
            전체 {completedTodos}/{totalTodos} 완료 • {lists.length}개 리스트
          </p>
        </div>

        <Card className="shadow-lg mb-6 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-300">➕ 새로운 리스트 추가</CardTitle>
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
              <Button
                onClick={handleAddList}
                disabled={addingList || newListName.trim() === ""}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {addingList ? "⏳" : "➕"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {lists.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-8 text-muted-foreground">
              <p>📝 아직 리스트가 없습니다.</p>
              <p className="text-sm mt-1">위에서 새로운 리스트를 추가해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const listTodos = todosByList[list.id] || []
              const completedCount = listTodos.filter((todo) => todo.completed).length

              return (
                <Card key={list.id} className="shadow-lg border-purple-200 dark:border-purple-800">
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
                          <Button size="sm" variant="ghost" onClick={handleSaveListEdit}>
                            ✅
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelListEdit}>
                            ❌
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <CardTitle className="text-lg text-purple-700 dark:text-purple-300">{list.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {completedCount}/{listTodos.length} 완료
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditList(list.id, list.name)}>
                              ✏️
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteList(list.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              🗑️
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
                        size="sm"
                        onClick={() => handleAddTodo(list.id)}
                        disabled={addingTodos[list.id] || !newTodoTexts[list.id]?.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {addingTodos[list.id] ? "⏳" : "➕"}
                      </Button>
                    </div>

                    {listTodos.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">📋 할일이 없습니다</div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {listTodos.map((todo) => (
                          <div key={todo.id} className="flex items-center gap-2 p-2 rounded border bg-card/50">
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={(checked) => handleToggleTodo(todo.id, checked as boolean, list.id)}
                            />
                            <span
                              className={`flex-1 text-sm ${
                                todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {todo.completed ? "✅" : "⭕"} {todo.text}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTodo(todo.id, list.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              🗑️
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
