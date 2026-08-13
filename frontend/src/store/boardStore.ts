import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete, type ApiUser } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  dob?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO timestamp
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  tag: string; // e.g., 'AI Writer', 'Data Insights', 'Sentiment AI'
  assigneeId: string | null;
  commentsCount: number;
  priority?: Priority;
  comments?: Comment[];
  imageUrl?: string;
  date?: string; // YYYY-MM-DD format
}

export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface BoardState {
  tasks: Task[];
  users: User[];
  searchQuery: string;
  selectedTagFilter: string | null;
  isLoadingUsers: boolean;
  theme: 'light' | 'dark';
  toast: Toast | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'commentsCount'>) => Promise<void>;
  updateTask: (id: string, updatedFields: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  /** Move a task to a status, optionally repositioning it before `overId` (a task id) for reordering. */
  moveTask: (id: string, status: Task['status'], overId?: string) => Promise<void>;
  addComment: (taskId: string, text: string, author?: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedTagFilter: (tag: string | null) => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: () => void;
}

const COLUMN_IDS = ['todo', 'doing', 'done'];

// Seed tasks have been replaced with live database tasks.

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: [],
      users: [],
      searchQuery: '',
      selectedTagFilter: null,
      isLoadingUsers: false,
      theme: 'light',
      toast: null,
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      showToast: (message, type = 'info') => {
        const id = Date.now();
        set({ toast: { id, message, type } });
        setTimeout(() => {
          if (get().toast?.id === id) set({ toast: null });
        }, 3200);
      },
      dismissToast: () => set({ toast: null }),

      fetchTasks: async () => {
        try {
          const fetchedTasks = await apiGet<Task[]>('/tasks');
          set({ tasks: fetchedTasks });
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to load tasks', 'error');
        }
      },

      fetchUsers: async () => {
        set({ isLoadingUsers: true });
        let users: User[] = [];
        try {
          const apiUsers = await apiGet<ApiUser[]>('/users');
          users = apiUsers.map((u) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            dob: u.dob ?? undefined,
          }));
        } catch {
          users = [];
        }
        set({ users, isLoadingUsers: false });
      },

      addTask: async (newTaskData) => {
        try {
          const created = await apiPost<Task>('/tasks', newTaskData);
          set((state) => ({
            tasks: [...state.tasks, created]
          }));
          get().showToast('Task created successfully!', 'success');
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to create task', 'error');
        }
      },

      updateTask: async (id, updatedFields) => {
        try {
          const updated = await apiPut<Task>(`/tasks/${id}`, updatedFields);
          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? updated : task))
          }));
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to update task', 'error');
        }
      },

      deleteTask: async (id) => {
        try {
          await apiDelete(`/tasks/${id}`);
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id)
          }));
          get().showToast('Task deleted successfully!', 'success');
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to delete task', 'error');
        }
      },

      moveTask: async (id, status, overId) => {
        // Optimistically update locally
        set((state) => {
          const tasks = [...state.tasks];
          const fromIdx = tasks.findIndex((t) => t.id === id);
          if (fromIdx < 0) return {};

          const [moved] = tasks.splice(fromIdx, 1);
          const updated = { ...moved, status };

          let insertIdx = tasks.length;
          if (overId && overId !== id && !COLUMN_IDS.includes(overId)) {
            const overIdx = tasks.findIndex((t) => t.id === overId);
            if (overIdx >= 0) insertIdx = overIdx;
          }
          tasks.splice(insertIdx, 0, updated);
          return { tasks };
        });

        // Trigger API update
        try {
          await apiPut(`/tasks/${id}`, { status });
        } catch (err: any) {
          // Re-sync if API call fails
          get().fetchTasks();
          get().showToast('Failed to move task', 'error');
        }
      },

      addComment: async (taskId, text, _author) => {
        try {
          const newComment = await apiPost<Comment>(`/tasks/${taskId}/comments`, { text });
          set((state) => ({
            tasks: state.tasks.map((task) => {
              if (task.id !== taskId) return task;
              const comments = [...(task.comments ?? []), newComment];
              return { ...task, comments, commentsCount: comments.length };
            })
          }));
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to add comment', 'error');
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTagFilter: (tag) => set({ selectedTagFilter: tag }),
    }),
    {
      name: 'sprint-board-storage',
      version: 2,
      partialize: (state) => ({ theme: state.theme }), // only persist theme
    }
  )
);
