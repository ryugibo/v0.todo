"use client"

import { useState } from "react"
import TodoApp from "@/components/todo-app"

export default function HomePage() {
  const [showDemo, setShowDemo] = useState(false)

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <div className="py-4">
          <div className="text-center mb-6">
            <img src="/icon-512x512.png" alt="GameTodo Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
            <div className="flex justify-center items-center gap-4">
              <span className="text-purple-700">데모 모드</span>
              <button
                onClick={() => setShowDemo(false)}
                className="text-sm text-purple-500 hover:text-purple-700 underline"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
          <TodoApp />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <img src="/icon-512x512.png" alt="GameTodo Logo" className="w-24 h-24 mx-auto mb-6 rounded-2xl" />
        <h1 className="text-4xl font-bold text-purple-800 mb-4">🎮 GameTodo</h1>
        <p className="text-purple-600 mb-8">게이미피케이션이 적용된 할일 관리 앱</p>
        <div className="space-y-4">
          <button
            onClick={() => setShowDemo(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            데모 모드로 체험하기
          </button>
          <div className="text-sm text-purple-500">
            <p>✨ 보라색 테마</p>
            <p>🎮 체크마크 게임 컨트롤러 로고</p>
            <p>📱 PWA 지원</p>
            <p>🎯 게이미피케이션 준비</p>
          </div>
        </div>
      </div>
    </div>
  )
}
