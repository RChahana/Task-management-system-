import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { getNextStatus, STATUS_LABELS, STATUS_COLORS, formatDate, isTerminal } from "../utils/statusUtils";
import { FiTrash2, FiArrowRight } from "react-icons/fi";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const nextStatus = getNextStatus(task.status);
  const borderColor = STATUS_COLORS[task.status]?.border || "#e2e8f0";

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setSaving(true);
    try {
      await onUpdate(task.id, { status: nextStatus });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    padding: "11px 13px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const focusedInput = { borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" };
  const buttonBase = {
    borderRadius: "12px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    minWidth: 90,
    border: "1px solid transparent",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        border: `1px solid ${hovered ? borderColor : "#e2e8f0"}`,
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: hovered ? "0 16px 30px rgba(15,23,42,0.08)" : "0 3px 10px rgba(15,23,42,0.05)",
        opacity: deleting ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {editing ? (
            <input
              style={{
                ...inputStyle,
                fontWeight: 700,
                fontSize: "1rem",
                ...(focusedField === "title" ? focusedInput : {}),
              }}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              maxLength={255}
              autoFocus
            />
          ) : (
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-word" }}>
              {task.title}
            </div>
          )}
          <div style={{ marginTop: 8, display: "flex", gap: "10px", flexWrap: "wrap", color: "#64748b", fontSize: "0.78rem" }}>
            <span>#{task.id}</span>
            <span>Created {formatDate(task.created_at)}</span>
            {task.updated_at && task.updated_at !== task.created_at && <span>· Updated {formatDate(task.updated_at)}</span>}
          </div>
        </div>

        <StatusBadge status={task.status} />
      </div>

      {editing ? (
        <textarea
          style={{
            ...inputStyle,
            minHeight: 78,
            resize: "vertical",
            color: "#475569",
            ...(focusedField === "desc" ? focusedInput : {}),
          }}
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onFocus={() => setFocusedField("desc")}
          onBlur={() => setFocusedField(null)}
          placeholder="Description (optional)"
          maxLength={2000}
        />
      ) : task.description ? (
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, fontSize: "0.92rem" }}>
          {task.description}
        </p>
      ) : (
        <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No description added.</div>
      )}

      {isTerminal(task.status) && !editing && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "999px",
            background: "#ecfdf5",
            color: "#166534",
            border: "1px solid #bbf7d0",
            fontSize: "0.82rem",
            fontWeight: 600,
          }}
        >
          ✓ Completed – no further transitions
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        {nextStatus && !editing && (
          <button
            onClick={handleAdvance}
            disabled={saving}
            style={{
              ...buttonBase,
              padding: "12px 16px",
              backgroundColor: "#2563eb",
              color: "#fff",
              borderColor: "#2563eb",
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.18)",
            }}
          >
            <FiArrowRight style={{ marginRight: 8 }} />
            {STATUS_LABELS[nextStatus]}
          </button>
        )}

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              ...buttonBase,
              padding: "10px 14px",
              backgroundColor: "#f8fafc",
              color: "#475569",
              borderColor: "#e2e8f0",
            }}
          >
            ✎ Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || saving}
              style={{
                ...buttonBase,
                padding: "10px 14px",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                borderColor: "#4f46e5",
                opacity: !editTitle.trim() || saving ? 0.65 : 1,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                ...buttonBase,
                padding: "10px 14px",
                backgroundColor: "#f8fafc",
                color: "#475569",
                borderColor: "#e2e8f0",
              }}
            >
              Cancel
            </button>
          </>
        )}

        {!editing && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              ...buttonBase,
              marginLeft: "auto",
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              borderColor: "#fecaca",
            }}
          >
            <FiTrash2 style={{ marginRight: 8 }} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}