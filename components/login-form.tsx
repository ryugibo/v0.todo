"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"
import Image from "next/image"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          로그인 중...
        </>
      ) : (
        "로그인"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Image src="/icon-512x512.png" alt="GameTodo Logo" width={80} height={80} className="rounded-2xl" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">로그인</CardTitle>
        <CardDescription className="text-gray-300">계정에 로그인하여 투두리스트를 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-sm text-gray-300">
            계정이 없으신가요?{" "}
            <Link href="/signup-demo" className="text-purple-400 hover:text-purple-300 underline">
              회원가입
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
