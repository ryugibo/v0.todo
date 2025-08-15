"use client"
import { useState } from "react"

interface TodoList {
  id: string
  name: string
  created_at: string
}

interface Todo {
  id: string
  text: string
  completed: boolean
  list_id: string
  created_at: string
}

export default function SimpleTodoApp() {
  const [lists, setLists] = useState<TodoList[]>([])
  const [todosByList, setTodosByList] = useState<Record<string, Todo[]>>({})
  const [loading, setLoading] = useState(false)
  const [newListName, setNewListName] = useState("")

  const getTotalStats = () => {
    let totalTodos = 0
    let completedTodos = 0

    Object.values(todosByList).forEach((todos) => {
      totalTodos += todos.length
      completedTodos += todos.filter((todo) => todo.completed).length
    })

    return { totalTodos, completedTodos }
  }

  const handleAddList = () => {
    if (newListName.trim() === "") return

    const newList: TodoList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      created_at: new Date().toISOString(),
    }

    setLists([...lists, newList])
    setTodosByList({ ...todosByList, [newList.id]: [] })
    setNewListName("")
  }

  const handleDeleteList = (listId: string) => {
    if (!confirm("이 리스트와 모든 할일을 삭제하시겠습니까?")) return

    setLists(lists.filter((list) => list.id !== listId))
    const newTodosByList = { ...todosByList }
    delete newTodosByList[listId]
    setTodosByList(newTodosByList)
  }

  const handleAddTodo = (listId: string, todoText: string) => {
    if (!todoText.trim()) return

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: todoText.trim(),
      completed: false,
      list_id: listId,
      created_at: new Date().toISOString(),
    }

    setTodosByList({
      ...todosByList,
      [listId]: [newTodo, ...(todosByList[listId] || [])],
    })
  }

  const handleToggleTodo = (todoId: string, listId: string) => {
    setTodosByList({
      ...todosByList,
      [listId]: todosByList[listId].map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    })
  }

  const handleDeleteTodo = (todoId: string, listId: string) => {
    setTodosByList({
      ...todosByList,
      [listId]: todosByList[listId].filter((todo) => todo.id !== todoId),
    })
  }

  const { totalTodos, completedTodos } = getTotalStats()

  return (
    <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#7c3aed", marginBottom: "8px" }}>🎮 GameTodo</h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          전체 {completedTodos}/{totalTodos} 완료 • {lists.length}개 리스트
        </p>
      </div>

      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#7c3aed", marginBottom: "16px" }}>
          ➕ 새로운 리스트 추가
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="새로운 리스트 이름을 입력하세요..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddList()}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={handleAddList}
            disabled={newListName.trim() === ""}
            style={{
              padding: "8px 16px",
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: newListName.trim() === "" ? "not-allowed" : "pointer",
              opacity: newListName.trim() === "" ? 0.5 : 1,
            }}
          >
            ➕
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center",
            backgroundColor: "white",
            color: "#6b7280",
          }}
        >
          <p>📝 아직 리스트가 없습니다.</p>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>위에서 새로운 리스트를 추가해보세요!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {lists.map((list) => {
            const listTodos = todosByList[list.id] || []
            const completedCount = listTodos.filter((todo) => todo.completed).length

            return (
              <div
                key={list.id}
                style={{
                  border: "1px solid #c4b5fd",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#7c3aed", margin: 0 }}>{list.name}</h3>
                      <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0 0" }}>
                        {completedCount}/{listTodos.length} 완료
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    <input
                      type="text"
                      placeholder="새로운 할일..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement
                          handleAddTodo(list.id, target.value)
                          target.value = ""
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleAddTodo(list.id, input.value)
                        input.value = ""
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ➕
                    </button>
                  </div>

                  {listTodos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px", color: "#6b7280", fontSize: "14px" }}>
                      📋 할일이 없습니다
                    </div>
                  ) : (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {listTodos.map((todo) => (
                        <div
                          key={todo.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            marginBottom: "8px",
                            backgroundColor: "#f9fafb",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id, list.id)}
                            style={{ cursor: "pointer" }}
                          />
                          <span
                            style={{
                              flex: 1,
                              fontSize: "14px",
                              textDecoration: todo.completed ? "line-through" : "none",
                              color: todo.completed ? "#6b7280" : "#111827",
                            }}
                          >
                            {todo.completed ? "✅" : "⭕"} {todo.text}
                          </span>
                          <button
                            onClick={() => handleDeleteTodo(todo.id, list.id)}
                            style={{
                              padding: "2px 6px",
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
