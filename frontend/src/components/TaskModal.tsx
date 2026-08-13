import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, AlertTriangle } from 'lucide-react';
import { useBoardStore, type Task, type Priority } from '../store/boardStore';
import { Modal } from './ui/Modal';
import { todayStr } from '../utils/date';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task; // If provided, we are editing; else creating
  defaultStatus?: Task['status'];
}

const TAG_OPTIONS = [
  'Task Automate',
  'Sales Forecast',
  'Sentiment AI',
  'Script AI',
  'Lead Scoring',
  'Heatmap AI',
  'Social Boost',
  'AI Writer',
  'Data Insights',
  'Predictive AI',
  'Marketing AI',
  'Chatbots',
  'Finance AI'
];

const CURRENT_USER = 'Astra Admin';

const relativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, defaultStatus }) => {
  const { users, addTask, updateTask, deleteTask, addComment } = useBoardStore();
  // Read the live task from the store so newly-added comments render immediately.
  const liveTask = useBoardStore((s) => (task ? s.tasks.find((t) => t.id === task.id) : undefined));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [tag, setTag] = useState('Task Automate');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [newComment, setNewComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setTag(task.tag);
      setAssigneeId(task.assigneeId || '');
      setDate(task.date || '');
      setPriority(task.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || 'todo');
      setTag('Task Automate');
      setAssigneeId('');
      setDate(todayStr());
      setPriority('medium');
    }
    setNewComment('');
    setConfirmDelete(false);
  }, [task, defaultStatus, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description,
      status,
      tag,
      assigneeId: assigneeId || null,
      date: date || undefined,
      priority,
    };

    if (task) {
      updateTask(task.id, payload);
    } else {
      addTask(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    onClose();
  };

  const handleAddComment = () => {
    if (!task || !newComment.trim()) return;
    addComment(task.id, newComment.trim(), CURRENT_USER);
    setNewComment('');
  };

  const comments = liveTask?.comments ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="task-modal-title" className="w-full max-w-md">
      <div className="bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border-primary/50 flex items-center justify-between">
          <h3 id="task-modal-title" className="font-semibold text-text-heading text-sm">
            {task ? 'Edit Task' : 'Create Task'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-text-secondary hover:text-text-heading hover:bg-bg-tertiary p-1 rounded-lg transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="text-text-secondary font-medium block mb-1">Task Title</label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Optimize ML model metrics"
              className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="text-text-secondary font-medium block mb-1">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the work required..."
              rows={3}
              className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div>
              <label htmlFor="task-status" className="text-text-secondary font-medium block mb-1">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="text-text-secondary font-medium block mb-1">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Due date */}
            <div>
              <label htmlFor="task-date" className="text-text-secondary font-medium block mb-1">Due Date</label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Tag / Project */}
            <div>
              <label htmlFor="task-tag" className="text-text-secondary font-medium block mb-1">Project Tag</label>
              <select
                id="task-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all cursor-pointer"
              >
                {TAG_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="task-assignee" className="text-text-secondary font-medium block mb-1">Assignee</label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all cursor-pointer"
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Comments (edit mode only) */}
          {task && (
            <div className="border-t border-border-primary/50 pt-3 space-y-2.5">
              <span className="text-text-secondary font-semibold block">Comments ({comments.length})</span>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {comments.length === 0 && (
                  <p className="text-text-secondary/60 italic">No comments yet. Start the discussion below.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5">
                      {c.author.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px]">
                        <span className="font-semibold text-text-heading">{c.author}</span>
                        <span className="text-text-secondary/60 ml-1.5">{relativeTime(c.createdAt)}</span>
                      </p>
                      <p className="text-text-primary leading-relaxed break-words">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="Write a comment…"
                  aria-label="Write a comment"
                  className="flex-1 bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-lg px-3 py-2 text-text-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  aria-label="Add comment"
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-all cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border-primary/50">
            <div>
              {task && !confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg px-3 py-2 font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
              {task && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <AlertTriangle size={13} /> Delete?
                  </span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-1.5 font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-text-secondary hover:text-text-heading font-semibold cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>

            {!confirmDelete && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-transparent hover:bg-bg-tertiary text-text-secondary hover:text-text-heading rounded-lg px-4.5 py-2 font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4.5 py-2 font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer"
                >
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
