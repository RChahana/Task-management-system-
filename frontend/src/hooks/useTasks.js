// src/hooks/useTasks.js
// Custom hook encapsulating all task state and API interactions.

import { useState, useEffect, useCallback } from "react";
import { tasksApi } from "../api/tasks";
import toast from "react-hot-toast";

export function useTasks(statusFilter = null) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getAll(statusFilter);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // useEffect(() => {
  //   fetchTasks();
  //   const intervalId = setInterval(fetchTasks, 5000);
  //   return () => clearInterval(intervalId);
  // }, [fetchTasks]);
useEffect(() => {
  fetchTasks();
}, [fetchTasks]);

  const createTask = async (payload) => {
    try {
      const newTask = await tasksApi.create(payload);
      setTasks((prev) => [newTask, ...prev]);
      setTotal((t) => t + 1);
      toast.success("Task created!");
      return newTask;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateTask = async (id, payload) => {
    try {
      const updated = await tasksApi.update(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Task updated!");
      return updated;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTotal((t) => t - 1);
      toast.success("Task deleted.");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return { tasks, total, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
