import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete, type ApiUser } from '../lib/api';
import { useWorkspaceStore } from './workspaceStore';

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
  type?: string;
  epicId?: string | null;
  ticketKey?: string;
  tags?: string[];
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
  availableTags: string[];

  // Actions
  fetchTasks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchAvailableTags: () => Promise<void>;
  createAvailableTag: (name: string) => Promise<void>;
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
      availableTags: [],
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      showToast: (message, type = 'info') => {
        const id = Date.now();
        set({ toast: { id, message, type } });
        setTimeout(() => {
          if (get().toast?.id === id) set({ toast: null });
        }, 3200);
      },
      dismissToast: () => set({ toast: null }),

      fetchAvailableTags: async () => {
        try {
          const tags = await apiGet<string[]>('/tags');
          set({ availableTags: tags });
        } catch {
          // Ignore
        }
      },

      createAvailableTag: async (name: string) => {
        try {
          const cleanName = name.trim();
          if (!cleanName) return;
          const response = await apiPost<{ name: string }>('/tags', { name: cleanName });
          const createdTag = response.name;
          set((state) => {
            if (state.availableTags.includes(createdTag)) return {};
            return { availableTags: [...state.availableTags, createdTag] };
          });
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to create tag', 'error');
        }
      },

      fetchTasks: async () => {
        try {
          const workspaces = useWorkspaceStore.getState().workspaces;
          if (workspaces.length === 0) {
            set({ tasks: [] });
            return;
          }
          
          const filter = get().selectedTagFilter;
          const targetWorkspaces = filter 
            ? workspaces.filter(w => w.workspaceKey === filter)
            : workspaces;
            
          const allTickets: Task[] = [];
          for (const ws of targetWorkspaces) {
            const tickets = await apiGet<any[]>(`/workspaces/${ws.id}/tickets`);
            const mapped = tickets.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description || '',
              status: (t.status === 'IN_PROGRESS' ? 'doing' : (t.status === 'DONE' ? 'done' : 'todo')) as Task['status'],
              tag: ws.workspaceKey,
              assigneeId: t.assigneeId,
              commentsCount: 0,
              priority: t.priority?.toLowerCase() || 'medium',
              type: t.type,
              epicId: t.epicId,
              ticketKey: t.ticketKey,
              tags: t.tags || [],
              date: t.dueDate || undefined
            }));
            allTickets.push(...mapped);
          }
          
          set({ tasks: allTickets });
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
          const workspaces = useWorkspaceStore.getState().workspaces;
          const ws = workspaces.find(w => w.workspaceKey === newTaskData.tag) || workspaces[0];
          if (!ws) {
            get().showToast('No workspace found to add task', 'error');
            return;
          }
          
          const backendStatus = newTaskData.status === 'doing' ? 'IN_PROGRESS' : (newTaskData.status === 'done' ? 'DONE' : 'TODO');
          const payload = {
            title: newTaskData.title,
            description: newTaskData.description,
            status: backendStatus,
            type: 'TASK',
            priority: newTaskData.priority?.toUpperCase() || 'MEDIUM',
            dueDate: newTaskData.date || null,
            tags: newTaskData.tags || []
          };
          
          const created = await apiPost<any>(`/workspaces/${ws.id}/tickets`, payload);
          const mapped: Task = {
            id: created.id,
            title: created.title,
            description: created.description || '',
            status: (created.status === 'IN_PROGRESS' ? 'doing' : (created.status === 'DONE' ? 'done' : 'todo')) as Task['status'],
            tag: ws.workspaceKey,
            assigneeId: created.assigneeId,
            commentsCount: 0,
            priority: created.priority?.toLowerCase() || 'medium',
            type: created.type,
            epicId: created.epicId,
            ticketKey: created.ticketKey,
            tags: created.tags || [],
            date: created.dueDate || undefined
          };
          
          set((state) => ({
            tasks: [...state.tasks, mapped]
          }));
          get().showToast('Task created successfully!', 'success');
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to create task', 'error');
        }
      },

      updateTask: async (id, updatedFields) => {
        try {
          const task = get().tasks.find(t => t.id === id);
          if (!task) return;
          const workspaces = useWorkspaceStore.getState().workspaces;
          const ws = workspaces.find(w => w.workspaceKey === task.tag);
          if (!ws) return;
          
          const payload = {
            title: updatedFields.title !== undefined ? updatedFields.title : task.title,
            description: updatedFields.description !== undefined ? updatedFields.description : task.description,
            status: updatedFields.status !== undefined 
              ? (updatedFields.status === 'doing' ? 'IN_PROGRESS' : (updatedFields.status === 'done' ? 'DONE' : 'TODO'))
              : (task.status === 'doing' ? 'IN_PROGRESS' : (task.status === 'done' ? 'DONE' : 'TODO')),
            type: task.type || 'TASK',
            priority: updatedFields.priority !== undefined 
              ? updatedFields.priority.toUpperCase() 
              : (task.priority?.toUpperCase() || 'MEDIUM'),
            assigneeId: updatedFields.assigneeId !== undefined ? updatedFields.assigneeId : task.assigneeId,
            dueDate: updatedFields.date !== undefined ? (updatedFields.date || null) : (task.date || null),
            epicId: updatedFields.epicId !== undefined ? (updatedFields.epicId || null) : (task.epicId || null),
            tags: updatedFields.tags !== undefined ? updatedFields.tags : (task.tags || [])
          };

          const updated = await apiPut<any>(`/workspaces/${ws.id}/tickets/${id}`, payload);
          const mapped: Task = {
            id: updated.id,
            title: updated.title,
            description: updated.description || '',
            status: (updated.status === 'IN_PROGRESS' ? 'doing' : (updated.status === 'DONE' ? 'done' : 'todo')) as Task['status'],
            tag: ws.workspaceKey,
            assigneeId: updated.assigneeId,
            commentsCount: 0,
            priority: updated.priority?.toLowerCase() || 'medium',
            type: updated.type,
            epicId: updated.epicId,
            ticketKey: updated.ticketKey,
            tags: updated.tags || [],
            date: updated.dueDate || undefined
          };
          
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? mapped : t))
          }));
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to update task', 'error');
        }
      },

      deleteTask: async (id) => {
        try {
          const task = get().tasks.find(t => t.id === id);
          if (!task) return;
          const workspaces = useWorkspaceStore.getState().workspaces;
          const ws = workspaces.find(w => w.workspaceKey === task.tag);
          if (!ws) return;

          await apiDelete(`/workspaces/${ws.id}/tickets/${id}`);
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id)
          }));
          get().showToast('Task deleted successfully!', 'success');
        } catch (err: any) {
          get().showToast(err?.message ?? 'Failed to delete task', 'error');
        }
      },

      moveTask: async (id, status, overId) => {
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

        try {
          const task = get().tasks.find(t => t.id === id);
          if (!task) return;
          const workspaces = useWorkspaceStore.getState().workspaces;
          const ws = workspaces.find(w => w.workspaceKey === task.tag);
          if (!ws) return;

          const backendStatus = status === 'doing' ? 'IN_PROGRESS' : (status === 'done' ? 'DONE' : 'TODO');
          await apiPut(`/workspaces/${ws.id}/tickets/${id}`, {
            title: task.title,
            description: task.description,
            status: backendStatus,
            type: task.type || 'TASK',
            priority: task.priority?.toUpperCase() || 'MEDIUM',
            assigneeId: task.assigneeId,
            dueDate: task.date || null,
            tags: task.tags || []
          });
        } catch (err: any) {
          get().fetchTasks();
          get().showToast('Failed to move task', 'error');
        }
      },

      addComment: async (taskId, text, _author) => {
        try {
          set((state) => ({
            tasks: state.tasks.map((task) => {
              if (task.id !== taskId) return task;
              const newComment: Comment = {
                id: Math.random().toString(),
                author: _author || 'You',
                text,
                createdAt: new Date().toISOString()
              };
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
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
