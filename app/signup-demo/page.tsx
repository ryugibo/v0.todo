import { Suspense } from "react"
import SignUpForm from "@/components/signup-form"

export default function SignUpDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
