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
  user_id: string
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
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

  const addTodo = async () => {
    if (inputValue.trim() === "" || adding) return

    setAdding(true)
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
        .insert([{ text: inputValue.trim(), user_id: user.id }])
        .select()
        .single()

      if (error) {
        console.error("Error adding todo:", error)
        return
      }

      setTodos([data, ...todos])
      setInputValue("")
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setAdding(false)
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    try {
      const { error } = await supabase.from("todos").update({ completed: !todo.completed }).eq("id", id)

      if (error) {
        console.error("Error updating todo:", error)
        return
      }

      setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        console.error("Error deleting todo:", error)
        return
      }

      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-md mx-auto">
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
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">나의 할일</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 && `${completedCount}/${totalCount} 완료`}
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                개인 전용
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 할일 추가 입력 */}
            <div className="flex gap-2">
              <Input
                placeholder="새로운 할일을 입력하세요..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={adding}
              />
              <Button onClick={addTodo} size="icon" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {/* 할일 목록 */}
            <div className="space-y-2">
              {todos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>아직 할일이 없습니다.</p>
                  <p className="text-sm">위에서 새로운 할일을 추가해보세요!</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                    <span
                      className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {todo.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* 통계 */}
            {totalCount > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>전체: {totalCount}개</span>
                  <span>완료: {completedCount}개</span>
                  <span>남은 할일: {totalCount - completedCount}개</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
