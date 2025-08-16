"use client"

export default function TestAuthPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* 로고 */}
        <img
          src="/icon-512x512.png"
          alt="GameTodo Logo"
          style={{ width: "80px", height: "80px", marginBottom: "20px" }}
        />

        <h1 style={{ color: "#8b5cf6", marginBottom: "20px", fontSize: "24px" }}>GameTodo 인증 테스트</h1>

        <div style={{ marginBottom: "20px" }}>
          <button
            style={{
              background: "#8b5cf6",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() => (window.location.href = "/signup-demo")}
          >
            회원가입 테스트
          </button>

          <button
            style={{
              background: "#a855f7",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => (window.location.href = "/todo")}
          >
            Todo 앱 테스트
          </button>
        </div>

        <p style={{ color: "#666", fontSize: "14px" }}>인증 시스템 테스트 페이지입니다.</p>
      </div>
    </div>
  )
}
