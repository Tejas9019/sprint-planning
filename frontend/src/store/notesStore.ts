import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export type NoteColor = 'default' | 'yellow' | 'purple' | 'blue' | 'green';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  checklist: ChecklistItem[];
  color: NoteColor;
  tags: string[];
  pinned: boolean;
  deleted: boolean; // soft delete (trash)
  createdAt: string;
  updatedAt: string;
}

// Single source of truth for note colours — used by cards, the editor and pickers.
export const NOTE_COLORS: Array<{ key: NoteColor; label: string; swatch: string; card: string }> = [
  { key: 'default', label: 'Default', swatch: 'bg-bg-tertiary border-border-primary', card: 'bg-bg-secondary border-border-primary' },
  { key: 'yellow', label: 'Yellow', swatch: 'bg-amber-200 border-amber-300', card: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40' },
  { key: 'purple', label: 'Purple', swatch: 'bg-purple-200 border-purple-300', card: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40' },
  { key: 'blue', label: 'Blue', swatch: 'bg-blue-200 border-blue-300', card: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40' },
  { key: 'green', label: 'Green', swatch: 'bg-emerald-200 border-emerald-300', card: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40' },
];

export const noteCardClass = (color: NoteColor) =>
  (NOTE_COLORS.find((c) => c.key === color) ?? NOTE_COLORS[0]).card;

export interface NoteDraft {
  title?: string;
  body?: string;
  checklist?: ChecklistItem[];
  color?: NoteColor;
  tags?: string[];
  pinned?: boolean;
}

interface NotesState {
  notes: Note[];
  fetchNotes: () => Promise<void>;
  addNote: (draft: NoteDraft) => Promise<Note>;
  updateNote: (id: string, fields: Partial<Note>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setColor: (id: string, color: NoteColor) => Promise<void>;
  toggleChecklistItem: (noteId: string, itemId: string) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteForever: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      fetchNotes: async () => {
        try {
          const fetchedNotes = await apiGet<Note[]>('/notes');
          set({ notes: fetchedNotes });
        } catch {
          // Keep empty on failure
        }
      },

      addNote: async (draft) => {
        try {
          const note = await apiPost<Note>('/notes', {
            title: draft.title?.trim() ?? '',
            body: draft.body ?? '',
            checklist: draft.checklist ?? [],
            color: draft.color ?? 'default',
            tags: draft.tags ?? [],
            pinned: draft.pinned ?? false,
            deleted: false,
          });
          set((s) => ({ notes: [note, ...s.notes] }));
          return note;
        } catch (err: any) {
          throw new Error(err?.message ?? 'Failed to add note');
        }
      },

      updateNote: async (id, fields) => {
        try {
          const updated = await apiPut<Note>(`/notes/${id}`, fields);
          set((s) => ({
            notes: s.notes.map((n) => (n.id === id ? updated : n)),
          }));
        } catch {
          // Fallback or ignore
        }
      },

      togglePin: async (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return;
        try {
          const updated = await apiPut<Note>(`/notes/${id}`, { pinned: !note.pinned });
          set((s) => ({
            notes: s.notes.map((n) => (n.id === id ? updated : n)),
          }));
        } catch {}
      },

      setColor: async (id, color) => {
        try {
          const updated = await apiPut<Note>(`/notes/${id}`, { color });
          set((s) => ({
            notes: s.notes.map((n) => (n.id === id ? updated : n)),
          }));
        } catch {}
      },

      toggleChecklistItem: async (noteId, itemId) => {
        const note = get().notes.find((n) => n.id === noteId);
        if (!note) return;
        const updatedChecklist = note.checklist.map((it) =>
          it.id === itemId ? { ...it, done: !it.done } : it
        );
        try {
          const updated = await apiPut<Note>(`/notes/${noteId}`, { checklist: updatedChecklist });
          set((s) => ({
            notes: s.notes.map((n) => (n.id === noteId ? updated : n)),
          }));
        } catch {}
      },

      trashNote: async (id) => {
        try {
          const updated = await apiPut<Note>(`/notes/${id}`, { deleted: true, pinned: false });
          set((s) => ({
            notes: s.notes.map((n) => (n.id === id ? updated : n)),
          }));
        } catch {}
      },

      restoreNote: async (id) => {
        try {
          const updated = await apiPut<Note>(`/notes/${id}`, { deleted: false });
          set((s) => ({
            notes: s.notes.map((n) => (n.id === id ? updated : n)),
          }));
        } catch {}
      },

      deleteForever: async (id) => {
        try {
          await apiDelete(`/notes/${id}`);
          set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        } catch {}
      },

      emptyTrash: async () => {
        try {
          await apiDelete('/notes/trash/empty');
          set((s) => ({ notes: s.notes.filter((n) => !n.deleted) }));
        } catch {}
      },
    }),
    {
      name: 'notes-storage',
      partialize: () => ({}), // Don't persist notes in localStorage anymore
    }
  )
);
