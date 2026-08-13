import React, { useEffect, useState } from 'react';
import { X, Pin, Trash2, Plus, CheckSquare, Square } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { IconButton } from '../ui/IconButton';
import {
  useNotesStore, NOTE_COLORS,
  type Note, type NoteColor, type ChecklistItem,
} from '../../store/notesStore';

const genId = () => Math.random().toString(36).substring(2, 9);

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note; // editing when provided
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ isOpen, onClose, note }) => {
  const { addNote, updateNote, trashNote } = useNotesStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setChecklist(note.checklist);
      setTags(note.tags);
      setColor(note.color);
      setPinned(note.pinned);
    } else {
      setTitle('');
      setBody('');
      setChecklist([]);
      setTags([]);
      setColor('default');
      setPinned(false);
    }
    setTagInput('');
  }, [isOpen, note]);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const addChecklistItem = () =>
    setChecklist((prev) => [...prev, { id: genId(), text: '', done: false }]);

  const isEmpty = !title.trim() && !body.trim() && checklist.every((c) => !c.text.trim());

  const handleSave = () => {
    const cleanChecklist = checklist.filter((c) => c.text.trim());
    if (isEmpty) {
      onClose();
      return;
    }
    const payload = { title, body, checklist: cleanChecklist, tags, color, pinned };
    if (note) updateNote(note.id, payload);
    else addNote(payload);
    onClose();
  };

  const handleDelete = () => {
    if (note) trashNote(note.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSave} labelledBy="note-editor-title" className="w-full max-w-lg">
      <div className="bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-3.5 border-b border-border-primary/50 flex items-center justify-between">
          <h3 id="note-editor-title" className="sr-only">{note ? 'Edit note' : 'New note'}</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            aria-label="Note title"
            className="flex-1 bg-transparent text-sm font-semibold text-text-heading outline-none placeholder-text-secondary"
          />
          <div className="flex items-center gap-1">
            <IconButton label={pinned ? 'Unpin note' : 'Pin note'} size="sm" onClick={() => setPinned((p) => !p)} className={pinned ? 'text-purple-600 dark:text-purple-400' : ''}>
              <Pin size={15} className={pinned ? 'rotate-45' : ''} />
            </IconButton>
            <IconButton label="Close note" size="sm" onClick={handleSave}>
              <X size={15} />
            </IconButton>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Take a note…"
            rows={4}
            aria-label="Note body"
            className="w-full bg-transparent text-sm text-text-primary outline-none resize-none placeholder-text-secondary leading-relaxed"
          />

          {/* Checklist */}
          {checklist.length > 0 && (
            <ul className="space-y-1.5">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2 group/ci">
                  <button
                    type="button"
                    onClick={() => setChecklist((prev) => prev.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)))}
                    aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                    aria-pressed={item.done}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    {item.done ? <CheckSquare size={15} className="text-emerald-500" /> : <Square size={15} className="text-text-secondary" />}
                  </button>
                  <input
                    value={item.text}
                    onChange={(e) => setChecklist((prev) => prev.map((c) => (c.id === item.id ? { ...c, text: e.target.value } : c)))}
                    placeholder="List item"
                    aria-label="Checklist item"
                    className={`flex-1 bg-transparent text-xs outline-none ${item.done ? 'line-through text-text-secondary/70' : 'text-text-primary'}`}
                  />
                  <IconButton label="Remove item" size="sm" onClick={() => setChecklist((prev) => prev.filter((c) => c.id !== item.id))} className="opacity-0 group-hover/ci:opacity-100">
                    <X size={13} />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={addChecklistItem} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-medium cursor-pointer">
            <Plus size={13} /> Add checklist item
          </button>

          {/* Tags */}
          <div className="space-y-1.5 pt-1">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">
                    #{t}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="hover:text-rose-500 cursor-pointer">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
              }}
              onBlur={addTag}
              placeholder="Add a tag and press Enter"
              aria-label="Add tag"
              className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/40 rounded-lg px-2.5 py-1.5 text-xs outline-none text-text-primary"
            />
          </div>
        </div>

        {/* Footer: color picker + delete/done */}
        <div className="p-3 border-t border-border-primary/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" role="group" aria-label="Note color">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                aria-label={`${c.label} color`}
                aria-pressed={color === c.key}
                className={`w-5 h-5 rounded-full border ${c.swatch} ${color === c.key ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-bg-secondary' : ''} cursor-pointer`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {note && (
              <IconButton label="Move to trash" size="sm" onClick={handleDelete} className="hover:text-rose-600 dark:hover:text-rose-400">
                <Trash2 size={15} />
              </IconButton>
            )}
            <button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-1.5 text-xs font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer">
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
