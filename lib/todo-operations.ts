"use client"

import { createClient } from "@/lib/supabase/client"
import type { Todo } from "@/lib/types"

const supabase = createClient()

export const todoOperations = {
  // 투두 생성
  async createTodo(text: string, listId: string): Promise<Todo> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // 현재 리스트의 최대 order_index 조회
    const { data: maxOrderData } = await supabase
      .from("todos")
      .select("order_index")
      .eq("list_id", listId)
      .order("order_index", { ascending: false })
      .limit(1)

    const nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          text: text.trim(),
          list_id: listId,
          user_id: user.id,
          order_index: nextOrderIndex,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating todo:", error)
      throw error
    }

    return data
  },

  // 투두 완료 상태 토글
  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    const { data, error } = await supabase
      .from("todos")
      .update({
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating todo:", error)
      throw error
    }

    return data
  },

  // 투두 삭제
  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase.from("todos").delete().eq("id", id)

    if (error) {
      console.error("Error deleting todo:", error)
      throw error
    }
  },

  // 투두를 다른 리스트로 이동
  async moveTodo(todoId: string, newListId: string, newOrderIndex: number): Promise<Todo> {
    const { data, error } = await supabase
      .from("todos")
      .update({
        list_id: newListId,
        order_index: newOrderIndex,
        updated_at: new Date().toISOString(),
      })
      .eq("id", todoId)
      .select()
      .single()

    if (error) {
      console.error("Error moving todo:", error)
      throw error
    }

    return data
  },

  // 리스트 내에서 투두 순서 변경
  async reorderTodos(todos: Todo[]): Promise<void> {
    const updates = todos.map((todo, index) => ({
      id: todo.id,
      order_index: index,
      updated_at: new Date().toISOString(),
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from("todos")
        .update({
          order_index: update.order_index,
          updated_at: update.updated_at,
        })
        .eq("id", update.id)

      if (error) {
        console.error("Error reordering todos:", error)
        throw error
      }
    }
  },
}
