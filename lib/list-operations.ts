"use client"

import { createClient } from "@/lib/supabase/client"
import type { TodoList, Todo } from "@/lib/types"

const supabase = createClient()

export const listOperations = {
  // 모든 리스트 조회
  async getLists(): Promise<TodoList[]> {
    const { data, error } = await supabase.from("todo_lists").select("*").order("order_index", { ascending: true })

    if (error) {
      console.error("Error loading lists:", error)
      throw error
    }

    return data || []
  },

  // 리스트 생성
  async createList(name: string): Promise<TodoList> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // 현재 최대 order_index 조회
    const { data: maxOrderData } = await supabase
      .from("todo_lists")
      .select("order_index")
      .eq("user_id", user.id)
      .order("order_index", { ascending: false })
      .limit(1)

    const nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1

    const { data, error } = await supabase
      .from("todo_lists")
      .insert([
        {
          name: name.trim(),
          user_id: user.id,
          order_index: nextOrderIndex,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating list:", error)
      throw error
    }

    return data
  },

  // 리스트 수정
  async updateList(id: string, name: string): Promise<TodoList> {
    const { data, error } = await supabase
      .from("todo_lists")
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating list:", error)
      throw error
    }

    return data
  },

  // 리스트 삭제
  async deleteList(id: string): Promise<void> {
    // 먼저 해당 리스트의 모든 투두 삭제
    const { error: todosError } = await supabase.from("todos").delete().eq("list_id", id)

    if (todosError) {
      console.error("Error deleting todos:", todosError)
      throw todosError
    }

    // 리스트 삭제
    const { error } = await supabase.from("todo_lists").delete().eq("id", id)

    if (error) {
      console.error("Error deleting list:", error)
      throw error
    }
  },

  // 리스트 순서 변경
  async reorderLists(lists: TodoList[]): Promise<void> {
    const updates = lists.map((list, index) => ({
      id: list.id,
      order_index: index,
      updated_at: new Date().toISOString(),
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from("todo_lists")
        .update({
          order_index: update.order_index,
          updated_at: update.updated_at,
        })
        .eq("id", update.id)

      if (error) {
        console.error("Error reordering lists:", error)
        throw error
      }
    }
  },

  // 특정 리스트의 투두들 조회
  async getTodosByList(listId: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("list_id", listId)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error loading todos:", error)
      throw error
    }

    return data || []
  },

  // 모든 리스트의 투두들 조회
  async getAllTodos(): Promise<Record<string, Todo[]>> {
    const { data, error } = await supabase.from("todos").select("*").order("order_index", { ascending: true })

    if (error) {
      console.error("Error loading todos:", error)
      throw error
    }

    // 리스트별로 그룹화
    const todosByList: Record<string, Todo[]> = {}
    data?.forEach((todo) => {
      if (!todosByList[todo.list_id]) {
        todosByList[todo.list_id] = []
      }
      todosByList[todo.list_id].push(todo)
    })

    return todosByList
  },
}
