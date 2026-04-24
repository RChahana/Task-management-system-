import React from "react";
import { STATUS_LABELS, STATUS_COLORS } from "../utils/statusUtils";

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || {
    pill: "#f1f5f9",
    pillText: "#475569",
    dot: "#94a3b8",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        backgroundColor: c.pill,
        color: c.pillText,
        fontSize: "0.78rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: c.dot,
          display: "inline-block",
        }}
      />
      {STATUS_LABELS[status] || status}
    </span>
  );
}