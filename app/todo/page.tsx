"use client"

import { useState, useEffect } from "react"
import TodoApp from "@/components/todo-app"
import LoginForm from "@/components/login-form"
import { createClient } from "@/lib/supabase/client"

export default function TodoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <img src="/icon-512x512.png" alt="GameTodo Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
          <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-purple-700">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user && !showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <img src="/icon-512x512.png" alt="GameTodo Logo" className="w-24 h-24 mx-auto mb-6 rounded-2xl" />
          <h1 className="text-4xl font-bold text-purple-800 mb-4">🎮 GameTodo</h1>
          <p className="text-purple-600 mb-8">게이미피케이션이 적용된 할일 관리 앱</p>
          <div className="space-y-4">
            <button
              onClick={() => setShowLogin(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              로그인하기
            </button>
            <div className="text-sm text-purple-500">
              또는{" "}
              <button
                onClick={() => setUser({ id: "demo", email: "demo@example.com" })}
                className="underline hover:text-purple-700"
              >
                데모 모드로 체험하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user && showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowLogin(false)}
            className="mb-4 text-purple-600 hover:text-purple-800 flex items-center"
          >
            ← 뒤로가기
          </button>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
      <div className="py-4">
        <div className="text-center mb-6">
          <img src="/icon-512x512.png" alt="GameTodo Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
          {user && (
            <div className="flex justify-center items-center gap-4">
              <span className="text-purple-700">환영합니다, {user.email || "사용자"}님!</span>
              <button
                onClick={() => {
                  supabase.auth.signOut()
                  setUser(null)
                }}
                className="text-sm text-purple-500 hover:text-purple-700 underline"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
        <TodoApp />
      </div>
    </div>
  )
}
