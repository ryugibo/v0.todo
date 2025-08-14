"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Todo {
  id: string
  text: string
  completed: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodoText, setNewTodoText] = useState("")
  const [addingTodo, setAddingTodo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading todos:", error)
        return
      }

      setTodos(data || [])
    } catch (error) {
      console.error("Error loading todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async () => {
    if (newTodoText.trim() === "" || addingTodo) return

    setAddingTodo(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.error("User not authenticated")
        return
      }

      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            text: newTodoText.trim(),
            completed: false,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error adding todo:", error)
        return
      }

      setTodos([data, ...todos])
      setNewTodoText("")
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setAddingTodo(false)
    }
  }

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .update({ completed, updated_at: new Date().toISOString() })
        .eq("id", todoId)
        .select()
        .single()

      if (error) {
        console.error("Error toggling todo:", error)
        return
      }

      setTodos(todos.map((todo) => (todo.id === todoId ? data : todo)))
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", todoId)

      if (error) {
        console.error("Error deleting todo:", error)
        return
      }

      setTodos(todos.filter((todo) => todo.id !== todoId))
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTodo()
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
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

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">나의 할일 목록</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} 완료
          </p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>새로운 할일 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="새로운 할일을 입력하세요..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={addingTodo}
              />
              <Button onClick={handleAddTodo} disabled={addingTodo || newTodoText.trim() === ""}>
                {addingTodo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>할일 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>아직 할일이 없습니다.</p>
                <p className="text-sm mt-1">위에서 새로운 할일을 추가해보세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleTodo(todo.id, !todo.completed)}
                    />
                    <span
                      className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {todo.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
