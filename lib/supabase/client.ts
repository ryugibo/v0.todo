import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export type Todo = {
  id: string
  text: string
  completed: boolean
  created_at: string
  updated_at: string
  user_id: string
}
