import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export interface Workspace {
  id: string;
  name: string;
  workspaceKey: string;
  description?: string;
  ownerId: string;
  ticketCounter: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  isLoadingWorkspaces: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, workspaceKey: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name: string, description?: string) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  isLoadingWorkspaces: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoadingWorkspaces: true, error: null });
    try {
      const fetched = await apiGet<Workspace[]>('/workspaces');
      set({ workspaces: fetched, isLoadingWorkspaces: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load workspaces', isLoadingWorkspaces: false });
    }
  },

  createWorkspace: async (name: string, workspaceKey: string, description?: string) => {
    set({ isLoadingWorkspaces: true, error: null });
    try {
      const created = await apiPost<Workspace>('/workspaces', { name, workspaceKey, description });
      set((state) => ({
        workspaces: [...state.workspaces, created],
        isLoadingWorkspaces: false
      }));
      return created;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to create workspace', isLoadingWorkspaces: false });
      throw err;
    }
  },

  updateWorkspace: async (id: string, name: string, description?: string) => {
    set({ isLoadingWorkspaces: true, error: null });
    try {
      const updated = await apiPut<Workspace>(`/workspaces/${id}`, { name, description });
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
        isLoadingWorkspaces: false
      }));
      return updated;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update workspace', isLoadingWorkspaces: false });
      throw err;
    }
  },

  deleteWorkspace: async (id: string) => {
    set({ isLoadingWorkspaces: true, error: null });
    try {
      await apiDelete(`/workspaces/${id}`);
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id),
        isLoadingWorkspaces: false
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete workspace', isLoadingWorkspaces: false });
      throw err;
    }
  }
}));
