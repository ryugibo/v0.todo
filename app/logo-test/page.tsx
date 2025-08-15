import Image from "next/image"

export default function LogoTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">GameTodo 로고 테스트</h1>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">512x512 로고</h2>
            <Image
              src="/icon-512x512.png"
              alt="GameTodo Logo 512x512"
              width={128}
              height={128}
              className="rounded-2xl mx-auto"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">192x192 로고</h2>
            <Image
              src="/icon-192x192.png"
              alt="GameTodo Logo 192x192"
              width={96}
              height={96}
              className="rounded-2xl mx-auto"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Apple Touch Icon</h2>
            <Image
              src="/apple-touch-icon.png"
              alt="GameTodo Apple Touch Icon"
              width={80}
              height={80}
              className="rounded-2xl mx-auto"
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-300 text-lg">체크마크 모양의 게임 컨트롤러 로고가 제대로 표시되는지 확인해보세요!</p>
          <p className="text-purple-400 text-sm mt-2">보라색 테마와 게이미피케이션 컨셉에 맞는 디자인</p>
        </div>
      </div>
    </div>
  )
}
