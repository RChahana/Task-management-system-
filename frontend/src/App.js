import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useTasks } from "./hooks/useTasks";
import TaskForm from "./components/TaskForm";
import StatsBar from "./components/StatsBar";
import StatusBadge from "./components/StatusBadge";
import { getNextStatus } from "./utils/statusUtils";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const STATUS_ORDER = ["pending", "in-progress", "completed"];
const STATUS_SECTIONS = {
  pending: { label: "To Do", color: "#f59e0b", bg: "#fffbeb" },
  "in-progress": { label: "In Progress", color: "#3b82f6", bg: "#eff6ff" },
  completed: { label: "Done", color: "#22c55e", bg: "#ecfdf5" },
};

export default function App() {
  const [activeFilter, setActiveFilter] = useState(null);
  const { tasks, total, loading, error, fetchTasks, createTask, updateTask, deleteTask } =
    useTasks(activeFilter);

  // New state for table filters
  const [nameSort, setNameSort] = useState(null);
  const [dateSort, setDateSort] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  // New state for inline editing
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Filter tasks based on status filter
  const filteredTasks = tasks.filter((task) => {
    return !statusFilter || task.status === statusFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (nameSort) {
      const result = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      return nameSort === "asc" ? result : -result;
    }

    if (dateSort) {
      const result = new Date(a.created_at) - new Date(b.created_at);
      return dateSort === "asc" ? result : -result;
    }

    return 0;
  });

  // const grouped = STATUS_ORDER.reduce((acc, status) => {
  //   acc[status] = tasks.filter((task) => task.status === status);
  //   return acc;
  // }, {});

  const handleEditStart = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) return;
    await updateTask(editingTaskId, { title: editTitle.trim(), description: editDescription.trim() || null });
    setEditingTaskId(null);
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "'Inter', sans-serif" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.92rem",
            padding: "12px 16px",
          },
        }}
      />

      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              T
            </div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                Task Management Dashboard
              </div>
              <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 2 }}>
                FastAPI + SQLite + React frontend
              </div>
            </div>
          </div>

          <button
            onClick={fetchTasks}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ↻ Auto-refreshing
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 50px" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "22px",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#0f172a",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  Team Task Board
                </div>
                <div style={{ color: "#64748b", fontSize: "0.92rem" }}>
                  Manage tasks with strict status flow and clear section cards.
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ color: "#6366f1" }}>●</span>
                <span style={{ color: "#94a3b8" }}>pending</span>
                <span style={{ color: "#94a3b8" }}>→</span>
                <span style={{ color: "#3b82f6" }}>in-progress</span>
                <span style={{ color: "#94a3b8" }}>→</span>
                <span style={{ color: "#22c55e" }}>completed</span>
              </div>
            </div>

            <StatsBar tasks={tasks} />
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              padding: "22px",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              style={{
                marginBottom: "18px",
                color: "#0f172a",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              Add a new task
            </div>
            <TaskForm onCreate={createTask} />
          </div>
        </section>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {STATUS_ORDER.map((status) => {
              const active = activeFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status === activeFilter ? null : status)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                    background: active ? "#eef2ff" : "#ffffff",
                    color: active ? "#3730a3" : "#475569",
                    cursor: "pointer",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {STATUS_SECTIONS[status].label}
                </button>
              );
            })}
            <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.9rem" }}>
              {total} task{total !== 1 ? "s" : ""}
            </span>
          </div>
          {error && (
            <div
              style={{
                borderRadius: 16,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "14px 16px",
                color: "#b91c1c",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
        </section>

        <section style={{ background: "#ffffff", borderRadius: 18, padding: 24, boxShadow: "0 10px 25px rgba(15,23,42,0.05)" }}>
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Task list</h2>
              <p style={{ margin: "8px 0 0", color: "#64748b" }}>Use the table to scan tasks quickly and take actions.</p>
            </div>
            <span style={{ color: "#475569", fontSize: "0.95rem" }}>{sortedTasks.length} task{sortedTasks.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Filter inputs */}
          <div style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "12px" }}>
            <button
              onClick={() => {
                setNameSort(nameSort === "asc" ? "desc" : "asc");
                setDateSort(null);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Name
              {nameSort === "asc" ? <FiArrowUp /> : nameSort === "desc" ? <FiArrowDown /> : <span style={{ opacity: 0.4 }}><FiArrowUp /><FiArrowDown /></span>}
            </button>
            <button
              onClick={() => {
                setDateSort(dateSort === "asc" ? "desc" : "asc");
                setNameSort(null);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Created
              {dateSort === "asc" ? <FiArrowUp /> : dateSort === "desc" ? <FiArrowDown /> : <span style={{ opacity: 0.4 }}><FiArrowUp /><FiArrowDown /></span>}
            </button>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <option value="">All statuses</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_SECTIONS[status].label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr>
                  {["Task", "Status", "Created", "Updated", "Actions"].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        color: "#475569",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedTasks.map((task) => (
                  <tr key={task.id} style={{ background: "#fff" }}>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      {editingTaskId === task.id ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 4,
                            fontSize: "0.9rem",
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{task.title}</div>
                      )}
                      {editingTaskId === task.id ? (
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 4,
                            fontSize: "0.88rem",
                            marginTop: 6,
                          }}
                        />
                      ) : (
                        <div style={{ marginTop: 6, color: "#64748b", fontSize: "0.88rem" }}>
                          {task.description || "No description"}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                      {task.updated_at ? new Date(task.updated_at).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => updateTask(task.id, { status: getNextStatus(task.status) })}
                          disabled={!getNextStatus(task.status)}
                          style={{
                            borderRadius: 12,
                            border: "1px solid #cbd5e1",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "10px 14px",
                            cursor: getNextStatus(task.status) ? "pointer" : "not-allowed",
                          }}
                        >
                          Advance
                        </button>
                        {editingTaskId === task.id ? (
                          <>
                            <button
                              onClick={handleEditSave}
                              style={{
                                borderRadius: 12,
                                border: "1px solid #22c55e",
                                background: "#dcfce7",
                                color: "#15803d",
                                padding: "10px 14px",
                                cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              style={{
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#475569",
                                padding: "10px 14px",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditStart(task)}
                            style={{
                              borderRadius: 12,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              color: "#475569",
                              padding: "10px 14px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{
                            borderRadius: 12,
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#b91c1c",
                            padding: "10px 14px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {loading && (
          <div style={{ display: "grid", gap: "16px" }}>
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                style={{
                  height: 120,
                  borderRadius: 18,
                  background: "linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.2s infinite",
                }}
              />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        )}
      </main>
    </div>
  );
}