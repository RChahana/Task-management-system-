// src/api/tasks.js
// All task-related API calls.

import apiClient from "./client";

export const tasksApi = {
  /** Fetch all tasks, optional status filter */
  getAll: async (statusFilter = null) => {
    const params = statusFilter ? { status: statusFilter } : {};
    const { data } = await apiClient.get("/tasks/", { params });
    return data; // { total, tasks }
  },

  /** Fetch a single task by id */
  getById: async (id) => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },

  /** Create a new task */
  create: async (payload) => {
    const { data } = await apiClient.post("/tasks/", payload);
    return data;
  },

  /** Update a task (title / description / status) */
  update: async (id, payload) => {
    const { data } = await apiClient.put(`/tasks/${id}`, payload);
    return data;
  },

  /** Delete a task */
  delete: async (id) => {
    const { data } = await apiClient.delete(`/tasks/${id}`);
    return data;
  },
};
