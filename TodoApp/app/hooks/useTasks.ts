import { useState, useEffect, useCallback } from 'react';
import { Task, Subtask, Category, Priority } from '../types';
import { saveTasks, loadTasks, generateId } from '../utils/storage';
import { isToday, isOverdue } from '../utils/dateHelpers';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    const loadedTasks = await loadTasks();
    setTasks(loadedTasks);
    setLoading(false);
  };

  const persistTasks = useCallback(async (newTasks: Task[]) => {
    setTasks(newTasks);
    await saveTasks(newTasks);
  }, []);

  const addTask = useCallback(
    async (taskData: {
      title: string;
      notes?: string;
      dueDate?: string;
      category: Category;
      priority: Priority;
      subtasks?: Subtask[];
    }) => {
      const newTask: Task = {
        id: generateId(),
        title: taskData.title,
        notes: taskData.notes,
        dueDate: taskData.dueDate,
        category: taskData.category,
        priority: taskData.priority,
        subtasks: taskData.subtasks || [],
        completed: false,
        createdAt: new Date().toISOString(),
      };
      await persistTasks([newTask, ...tasks]);
    },
    [tasks, persistTasks]
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Omit<Task, 'id' | 'createdAt'>>
    ) => {
      const newTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      await persistTasks(newTasks);
    },
    [tasks, persistTasks]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const newTasks = tasks.filter((task) => task.id !== taskId);
      await persistTasks(newTasks);
    },
    [tasks, persistTasks]
  );

  const toggleTaskComplete = useCallback(
    async (taskId: string) => {
      const newTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      await persistTasks(newTasks);
    },
    [tasks, persistTasks]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const newTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return task;
      });
      await persistTasks(newTasks);
    },
    [tasks, persistTasks]
  );

  const getTaskById = useCallback(
    (taskId: string): Task | undefined => {
      return tasks.find((task) => task.id === taskId);
    },
    [tasks]
  );

  const getTodayTasks = useCallback((): Task[] => {
    const todayTasks = tasks.filter(
      (task) => !task.completed && task.dueDate && isToday(task.dueDate)
    );
    const overdueTasks = tasks.filter(
      (task) => !task.completed && task.dueDate && isOverdue(task.dueDate)
    );
    return [...overdueTasks, ...todayTasks];
  }, [tasks]);

  const getTasksByCategory = useCallback((): Record<Category, Task[]> => {
    const result: Record<Category, Task[]> = {
      Work: [],
      Personal: [],
      Health: [],
    };
    tasks.forEach((task) => {
      result[task.category].push(task);
    });
    return result;
  }, [tasks]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubtask,
    getTaskById,
    getTodayTasks,
    getTasksByCategory,
  };
};