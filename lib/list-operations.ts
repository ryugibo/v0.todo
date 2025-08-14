"use client"

import { createClient } from "@/lib/supabase/client"
import type { TodoList, Todo } from "@/lib/types"

const supabase = createClient()

export const listOperations = {
  // 모든 리스트 조회
  async getLists(): Promise<TodoList[]> {
    try {
      const { data, error } = await supabase.from("todo_lists").select("*").order("order_index", { ascending: true })

      if (error) {
        console.error("Error loading lists:", error)
        throw error
      }

      return data || []
    } catch (error) {
      // 테이블이 없는 경우 빈 배열 반환
      console.warn("Lists table not found, returning empty array")
      return []
    }
  },

  async ensureDefaultList(): Promise<TodoList> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // 기존 리스트가 있는지 확인
    try {
      const { data: existingLists } = await supabase.from("todo_lists").select("*").eq("user_id", user.id).limit(1)

      if (existingLists && existingLists.length > 0) {
        return existingLists[0]
      }
    } catch (error) {
      // 테이블이 없는 경우 무시
    }

    // 기본 리스트 생성
    try {
      const { data, error } = await supabase
        .from("todo_lists")
        .insert([
          {
            name: "기본 리스트",
            user_id: user.id,
            order_index: 0,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating default list:", error)
        throw error
      }

      return data
    } catch (error) {
      // 테이블이 없는 경우 임시 리스트 반환
      return {
        id: "default",
        name: "기본 리스트",
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_index: 0,
      }
    }
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
    try {
      // 먼저 해당 리스트의 모든 투두 삭제 (list_id 컬럼이 있는 경우에만)
      const { error: todosError } = await supabase.from("todos").delete().eq("list_id", id)

      if (todosError && !todosError.message.includes("column")) {
        console.error("Error deleting todos:", todosError)
        throw todosError
      }
    } catch (error) {
      // list_id 컬럼이 없는 경우 무시
      console.warn("Could not delete todos by list_id, column may not exist")
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

  async getTodosByList(listId: string): Promise<Todo[]> {
    try {
      let query = supabase.from("todos").select("*")

      try {
        // list_id 컬럼이 있는 경우에만 필터링
        if (listId !== "default") {
          query = query.eq("list_id", listId)
        } else {
          // 기본 리스트의 경우 list_id가 null이거나 "default"인 것들
          query = query.or(`list_id.is.null,list_id.eq.${listId}`)
        }
      } catch (error) {
        // list_id 컬럼이 없는 경우 모든 투두 반환
        console.warn("list_id column not found, returning all todos")
      }

      // order_index가 있으면 사용, 없으면 created_at 사용
      try {
        query = query.order("order_index", { ascending: true })
      } catch {
        query = query.order("created_at", { ascending: true })
      }

      const { data, error } = await query

      if (error) {
        console.error("Error loading todos:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getTodosByList:", error)
      return []
    }
  },

  // 모든 리스트의 투두들 조회
  async getAllTodos(): Promise<Record<string, Todo[]>> {
    try {
      const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading todos:", error)
        throw error
      }

      // 리스트별로 그룹화
      const todosByList: Record<string, Todo[]> = {}

      data?.forEach((todo) => {
        // list_id가 없는 경우 기본 리스트로 분류
        const listId = todo.list_id || "default"
        if (!todosByList[listId]) {
          todosByList[listId] = []
        }
        todosByList[listId].push(todo)
      })

      return todosByList
    } catch (error) {
      console.error("Error in getAllTodos:", error)
      if (error instanceof Error && error.message.includes("column")) {
        // 스키마가 업데이트되지 않은 경우 기본 처리
        try {
          const { data } = await supabase
            .from("todos")
            .select("id, text, completed, created_at, updated_at, user_id")
            .order("created_at", { ascending: true })
          return { default: data || [] }
        } catch (fallbackError) {
          console.error("Fallback query also failed:", fallbackError)
          return {}
        }
      }
      return {}
    }
  },
}
