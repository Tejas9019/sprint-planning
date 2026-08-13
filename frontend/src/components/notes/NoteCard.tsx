import React, { useRef, useState } from 'react';
import { Pin, Palette, Trash2, RotateCcw, CheckSquare, Square, X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { useClickAway } from '../../hooks/useClickAway';
import { useNotesStore, NOTE_COLORS, noteCardClass, type Note } from '../../store/notesStore';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  trashMode?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, trashMode }) => {
  const { togglePin, setColor, toggleChecklistItem, trashNote, restoreNote, deleteForever } = useNotesStore();
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  useClickAway(paletteRef, () => setShowPalette(false), showPalette);

  const doneCount = note.checklist.filter((c) => c.done).length;
  const hasChecklist = note.checklist.length > 0;

  const open = () => onEdit(note);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open note: ${note.title || 'Untitled'}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); open(); }
      }}
      className={`group relative break-inside-avoid mb-4 w-full text-left border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${noteCardClass(note.color)}`}
    >
      {/* Pin badge */}
      {note.pinned && !trashMode && (
        <Pin size={12} className="absolute top-2.5 right-2.5 text-text-secondary rotate-45" aria-hidden="true" />
      )}

      {note.title && <h3 className="text-sm font-semibold text-text-heading leading-snug pr-5 break-words">{note.title}</h3>}

      {note.body && (
        <p className="text-xs text-text-primary/90 mt-1.5 leading-relaxed whitespace-pre-wrap line-clamp-[8] break-words">
          {note.body}
        </p>
      )}

      {/* Checklist preview */}
      {hasChecklist && (
        <div className="mt-2 space-y-1">
          {note.checklist.slice(0, 6).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); if (!trashMode) toggleChecklistItem(note.id, item.id); }}
              aria-label={`${item.done ? 'Mark incomplete' : 'Mark complete'}: ${item.text}`}
              aria-pressed={item.done}
              className="flex items-start gap-1.5 text-left w-full cursor-pointer group/item"
            >
              {item.done ? (
                <CheckSquare size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Square size={13} className="text-text-secondary flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-[11px] leading-snug ${item.done ? 'line-through text-text-secondary/70' : 'text-text-primary'}`}>
                {item.text}
              </span>
            </button>
          ))}
          {note.checklist.length > 6 && (
            <span className="text-[10px] text-text-secondary pl-5">+{note.checklist.length - 6} more</span>
          )}
          <span className="text-[10px] text-text-secondary block pt-0.5">{doneCount}/{note.checklist.length} done</span>
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {note.tags.map((t) => (
            <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-text-secondary">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Hover toolbar */}
      <div
        className="flex items-center gap-0.5 mt-2.5 pt-2 border-t border-border-primary/30 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {trashMode ? (
          <>
            <IconButton label="Restore note" size="sm" onClick={() => restoreNote(note.id)} className="hover:text-emerald-600 dark:hover:text-emerald-400">
              <RotateCcw size={14} />
            </IconButton>
            <IconButton label="Delete forever" size="sm" onClick={() => deleteForever(note.id)} className="hover:text-rose-600 dark:hover:text-rose-400">
              <Trash2 size={14} />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton label={note.pinned ? 'Unpin note' : 'Pin note'} size="sm" onClick={() => togglePin(note.id)} className={note.pinned ? 'text-purple-600 dark:text-purple-400' : ''}>
              <Pin size={14} className={note.pinned ? 'rotate-45' : ''} />
            </IconButton>

            <div className="relative" ref={paletteRef}>
              <IconButton label="Change color" size="sm" onClick={() => setShowPalette((s) => !s)} aria-expanded={showPalette}>
                <Palette size={14} />
              </IconButton>
              {showPalette && (
                <div className="absolute z-20 bottom-full mb-1 left-0 flex items-center gap-1 bg-bg-secondary border border-border-primary rounded-full shadow-xl p-1.5">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => { setColor(note.id, c.key); setShowPalette(false); }}
                      aria-label={`${c.label} color`}
                      aria-pressed={note.color === c.key}
                      className={`w-5 h-5 rounded-full border ${c.swatch} ${note.color === c.key ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-bg-secondary' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <IconButton label="Move to trash" size="sm" onClick={() => trashNote(note.id)} className="hover:text-rose-600 dark:hover:text-rose-400">
              <X size={14} />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
};
