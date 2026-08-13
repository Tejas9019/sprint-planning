import React, { useMemo, useState } from 'react';
import { Lightbulb, Plus, Search, Trash2, StickyNote, ArrowLeft } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { NoteEditorModal } from './NoteEditorModal';
import { useNotesStore, type Note } from '../../store/notesStore';
import { useBoardStore } from '../../store/boardStore';

const masonry = 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4';

export const NotesView: React.FC = () => {
  const { notes, emptyTrash } = useNotesStore();
  const { showToast } = useBoardStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const active = useMemo(() => notes.filter((n) => !n.deleted), [notes]);
  const trashed = useMemo(() => notes.filter((n) => n.deleted), [notes]);

  const allTags = useMemo(
    () => Array.from(new Set(active.flatMap((n) => n.tags))).sort(),
    [active]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.filter((n) => {
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q)) ||
        n.checklist.some((c) => c.text.toLowerCase().includes(q));
      const matchesTag = !activeTag || n.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [active, query, activeTag]);

  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);
  const showSections = pinned.length > 0;

  const openNew = () => { setEditing(undefined); setEditorOpen(true); };
  const openEdit = (note: Note) => { setEditing(note); setEditorOpen(true); };

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-primary/60 bg-bg-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
        <div>
          <h1 className="text-base font-bold text-text-heading tracking-tight flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            {showTrash ? 'Trash' : 'Notes'}
          </h1>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {showTrash ? `${trashed.length} in trash` : `${active.length} notes`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showTrash ? (
            <>
              <button onClick={() => setShowTrash(false)} className="flex items-center gap-1.5 px-3 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer">
                <ArrowLeft size={14} /> Back to notes
              </button>
              <button
                onClick={() => { emptyTrash(); showToast('Trash emptied', 'info'); }}
                disabled={trashed.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 size={14} /> Empty trash
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowTrash(true)} className="flex items-center gap-1.5 px-3 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-secondary hover:text-text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer">
                <Trash2 size={14} /> Trash
              </button>
              <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer">
                <Plus size={14} /> New note
              </button>
            </>
          )}
        </div>
      </header>

      {/* Toolbar */}
      {!showTrash && (
        <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <label htmlFor="notes-search" className="sr-only">Search notes</label>
            <input
              id="notes-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes…"
              className="w-full bg-bg-secondary border border-border-primary focus:border-purple-500/40 rounded-lg py-2 pl-9 pr-3 text-xs outline-none text-text-primary transition-all"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTag(null)}
                aria-pressed={activeTag === null}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${activeTag === null ? 'bg-purple-600 text-white' : 'bg-bg-secondary border border-border-primary text-text-secondary hover:text-text-primary'}`}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag((cur) => (cur === t ? null : t))}
                  aria-pressed={activeTag === t}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${activeTag === t ? 'bg-purple-600 text-white' : 'bg-bg-secondary border border-border-primary text-text-secondary hover:text-text-primary'}`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {showTrash ? (
          trashed.length === 0 ? (
            <EmptyState icon={<Trash2 size={26} />} text="Trash is empty." />
          ) : (
            <div className={masonry}>
              {trashed.map((n) => <NoteCard key={n.id} note={n} onEdit={() => {}} trashMode />)}
            </div>
          )
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<StickyNote size={26} />}
            text={active.length === 0 ? 'No notes yet. Capture your first thought.' : 'No notes match your search.'}
            action={active.length === 0 ? <button onClick={openNew} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer">New note</button> : undefined}
          />
        ) : (
          <div className="space-y-5 pt-1">
            {showSections && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Pinned</h2>
                <div className={masonry}>
                  {pinned.map((n) => <NoteCard key={n.id} note={n} onEdit={openEdit} />)}
                </div>
              </section>
            )}
            <section>
              {showSections && <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Others</h2>}
              <div className={masonry}>
                {others.map((n) => <NoteCard key={n.id} note={n} onEdit={openEdit} />)}
              </div>
            </section>
          </div>
        )}
      </div>

      <NoteEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} note={editing} />
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; text: string; action?: React.ReactNode }> = ({ icon, text, action }) => (
  <div className="flex flex-col items-center justify-center text-center gap-2 py-20 text-text-secondary select-none">
    <span className="text-text-secondary/60">{icon}</span>
    <p className="text-sm font-medium">{text}</p>
    {action}
  </div>
);
