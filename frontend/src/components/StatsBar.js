import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { STATUS_COLORS, STATUS_LABELS } from "../utils/statusUtils";

const STATUSES = ["pending", "in-progress", "completed"];
const RADIAN = Math.PI / 180;

export default function StatsBar({ tasks }) {
  const counts = tasks.reduce(
    (acc, task) => {
      if (acc[task.status] !== undefined) acc[task.status]++;
      return acc;
    },
    { pending: 0, "in-progress": 0, completed: 0 }
  );

  const total = tasks.length;
  const completedPct = total > 0 ? Math.round((counts.completed / total) * 100) : 0;

  const chartData = STATUSES.map((status) => ({
    name: STATUS_LABELS[status],
    value: counts[status],
    color: STATUS_COLORS[status]?.dot || "#94a3b8",
  })).filter((entry) => entry.value > 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#0f172a"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="0.72rem"
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr", // Adjust for chart
        gap: "18px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: "22px",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Existing stats section */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "grid",
            placeItems: "center",
            color: "#ffffff",
            fontSize: "1.8rem",
          }}
        >
          {total}
        </div>
        <div>
          <div style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 700 }}>Task summary</div>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            {total === 0 ? "No tasks yet" : `${completedPct}% completed · ${counts.pending} pending`}
          </div>
        </div>
      </div>

      {/* New pie chart section */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={40}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Existing progress bar */}
      <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.88rem" }}>
          <span>Completed progress</span>
          <span>{completedPct}%</span>
        </div>
        <div style={{ height: 12, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
          <div
            style={{
              width: `${completedPct}%`,
              height: "100%",
              background: "linear-gradient(90deg,#22c55e,#0891b2)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}