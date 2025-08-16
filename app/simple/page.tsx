export default function SimplePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <img
          src="/icon-512x512.png"
          alt="GameTodo Logo"
          style={{
            width: "80px",
            height: "80px",
            marginBottom: "20px",
          }}
        />
        <h1
          style={{
            color: "#8b5cf6",
            fontSize: "28px",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          GameTodo
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "16px",
            marginBottom: "30px",
          }}
        >
          게이미피케이션 Todo 앱
        </p>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              color: "#8b5cf6",
              fontSize: "18px",
              marginBottom: "15px",
            }}
          >
            로그인
          </h3>
          <input
            type="email"
            placeholder="이메일"
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          />
          <button
            style={{
              width: "100%",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            로그인
          </button>
        </div>

        <div
          style={{
            background: "#f0f9ff",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              color: "#0ea5e9",
              fontSize: "18px",
              marginBottom: "15px",
            }}
          >
            회원가입
          </h3>
          <input
            type="email"
            placeholder="이메일"
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          />
          <button
            style={{
              width: "100%",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  )
}
