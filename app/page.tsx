import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TodoApp from "@/components/todo-app"
import UserHeader from "@/components/user-header"

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <UserHeader user={user} />
      <TodoApp />
    </div>
  )
}
