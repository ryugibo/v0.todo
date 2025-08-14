export interface TodoList {
  id: string
  name: string
  user_id: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  list_id: string
  user_id: string
  order_index: number
  created_at: string
  updated_at: string
}
