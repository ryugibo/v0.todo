import SimpleTodoApp from "@/components/simple-todo-app"

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)" }}>
      <div style={{ padding: "16px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="/icon-512x512.png"
            alt="GameTodo Logo"
            style={{ width: "64px", height: "64px", margin: "0 auto 16px" }}
          />
        </div>
        <SimpleTodoApp />
      </div>
    </div>
  )
}
