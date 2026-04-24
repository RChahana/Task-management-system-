import React, { useState } from "react";

export default function TaskForm({ onCreate, disabled }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() || undefined });
      setTitle("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = {
    width: "100%",
    padding: "12px 15px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: "0.95rem",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
  };

  const focusStyle = { borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "grid", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#475569", fontWeight: 700, fontSize: "0.82rem" }}>
            Task title <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            style={{ ...inputBase, ...(focused === "title" ? focusStyle : {}) }}
            type="text"
            placeholder="Design landing page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocused("title")}
            onBlur={() => setFocused(null)}
            disabled={submitting || disabled}
            maxLength={255}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#475569", fontWeight: 700, fontSize: "0.82rem" }}>
            Description
          </label>
          <textarea
            style={{ ...inputBase, minHeight: 100, resize: "vertical", ...(focused === "desc" ? focusStyle : {}) }}
            placeholder="Optional — add details for your task"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setFocused("desc")}
            onBlur={() => setFocused(null)}
            disabled={submitting || disabled}
            maxLength={2000}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || submitting || disabled}
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: "none",
          background: "linear-gradient(135deg, #4f46e5, #2563eb)",
          color: "#fff",
          fontWeight: 700,
          cursor: !title.trim() || submitting ? "not-allowed" : "pointer",
          boxShadow: "0 16px 30px rgba(79, 70, 229, 0.18)",
        }}
      >
        {submitting ? "Adding task…" : "+ Add task"}
      </button>
    </form>
  );
}