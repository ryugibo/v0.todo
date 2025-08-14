"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, User, Loader2 } from "lucide-react"
import { signout } from "@/lib/auth-actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useFormStatus } from "react-dom"

interface UserHeaderProps {
  user: SupabaseUser
}

function LogoutButton() {
  const { pending } = useFormStatus()

  return (
    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          로그아웃 중...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-1" />
          로그아웃
        </>
      )}
    </Button>
  )
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">투두리스트 관리</p>
            </div>
          </div>
          <form action={signout}>
            <LogoutButton />
          </form>
        </div>
      </Card>
    </div>
  )
}
