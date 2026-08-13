import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, ArrowUpRight } from 'lucide-react';
import { useClickAway } from '../../hooks/useClickAway';
import { useNotesStore, NOTE_COLORS, type NoteColor } from '../../store/notesStore';
import { useBoardStore } from '../../store/boardStore';

interface QuickCapturePopoverProps {
  onClose: () => void;
  onOpenFull: () => void;
}

export const QuickCapturePopover: React.FC<QuickCapturePopoverProps> = ({ onClose, onOpenFull }) => {
  const { addNote } = useNotesStore();
  const { showToast } = useBoardStore();
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<NoteColor>('default');

  // save(silent) — on click-away we save quietly; on the Save button we toast.
  const save = (silent = false) => {
    if (title.trim() || body.trim()) {
      addNote({ title, body, color });
      if (!silent) showToast('Note saved', 'success');
    }
    onClose();
  };

  useClickAway(ref, () => save(true), true);
  useEffect(() => { bodyRef.current?.focus(); }, []);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Quick note"
      className="fixed top-[72px] right-16 z-50 w-80 bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2 px-1">
        <Lightbulb size={13} className="text-amber-500" /> Quick note
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        aria-label="Note title"
        className="w-full bg-transparent text-sm font-semibold text-text-heading outline-none placeholder-text-secondary px-1"
      />
      <textarea
        ref={bodyRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
        }}
        placeholder="Take a note… (⌘/Ctrl+Enter to save)"
        rows={3}
        aria-label="Note body"
        className="w-full bg-transparent text-sm text-text-primary outline-none resize-none placeholder-text-secondary px-1 mt-1 leading-relaxed"
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-primary/40">
        <div className="flex items-center gap-1" role="group" aria-label="Note color">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColor(c.key)}
              aria-label={`${c.label} color`}
              aria-pressed={color === c.key}
              className={`w-4.5 h-4.5 rounded-full border ${c.swatch} ${color === c.key ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-bg-secondary' : ''} cursor-pointer`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onOpenFull} className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary cursor-pointer">
            Open Notes <ArrowUpRight size={12} />
          </button>
          <button onClick={() => save()} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
