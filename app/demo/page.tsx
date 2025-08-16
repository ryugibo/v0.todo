"use client"

export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 로고 */}
          <div className="flex justify-center mb-6">
            <img src="/icon-512x512.png" alt="GameTodo Logo" className="w-16 h-16" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">GameTodo 데모</h1>

          <div className="space-y-4">
            <button
              onClick={() => (window.location.href = "/signup-demo")}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              회원가입 페이지 보기
            </button>

            <button
              onClick={() => (window.location.href = "/todo")}
              className="w-full bg-purple-100 text-purple-700 py-3 px-4 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors border border-purple-300"
            >
              Todo 앱 보기
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">GameTodo - 게이미피케이션 Todo 앱</p>
          </div>
        </div>
      </div>
    </div>
  )
}
