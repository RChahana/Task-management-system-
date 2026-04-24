export const STATUS_ORDER = ["pending", "in-progress", "completed"];

export const STATUS_LABELS = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

export const STATUS_COLORS = {
  pending: {
    bg: "#fffbeb", text: "#92400e", border: "#fcd34d",
    dot: "#f59e0b", pill: "#fef3c7", pillText: "#b45309",
  },
  "in-progress": {
    bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd",
    dot: "#3b82f6", pill: "#dbeafe", pillText: "#1e40af",
  },
  completed: {
    bg: "#f0fdf4", text: "#166534", border: "#86efac",
    dot: "#22c55e", pill: "#dcfce7", pillText: "#15803d",
  },
};

export function getNextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

export function getValidTransitions(current) {
  const next = getNextStatus(current);
  return next ? [next] : [];
}

export function isTerminal(status) {
  return status === "completed";
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}