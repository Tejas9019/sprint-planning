import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, AlertTriangle, Bookmark, Bug, CheckSquare, Zap, ChevronDown, Bold, Italic, Link2, Code, List, HelpCircle, Maximize2, ListOrdered, Image, Paperclip } from 'lucide-react';
import { useBoardStore, type Task, type Priority } from '../store/boardStore';
import { Modal } from './ui/Modal';
import { todayStr } from '../utils/date';
import { getTagColorClass } from './TaskCard';
import { useWorkspaceStore } from '../store/workspaceStore';
import { apiUploadFile } from '../lib/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task; // If provided, we are editing; else creating
  defaultStatus?: Task['status'];
}

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

const ISSUE_TYPES = [
  { value: 'TASK', label: 'Task', icon: <CheckSquare size={14} className="text-blue-500 fill-blue-500/10" /> },
  { value: 'BUG', label: 'Bug', icon: <Bug size={14} className="text-rose-500 fill-rose-500/10" /> },
  { value: 'STORY', label: 'Story', icon: <Bookmark size={14} className="text-emerald-500 fill-emerald-500" /> },
  { value: 'EPIC', label: 'Epic', icon: <Zap size={14} className="text-purple-600 fill-purple-600" /> }
];

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, defaultStatus }) => {
  const { users, tasks, addTask, updateTask, deleteTask, addComment, availableTags, createAvailableTag, showToast } = useBoardStore();
  // Read the live task from the store so newly-added comments render immediately.
  const liveTask = useBoardStore((s) => (task ? s.tasks.find((t) => t.id === task.id) : undefined));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [tag, setTag] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [epicId, setEpicId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [type, setType] = useState<string>('TASK');
  const [newTagInput, setNewTagInput] = useState('');
  const [newComment, setNewComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const epics = tasks.filter(t => t.type === 'EPIC' && t.id !== task?.id);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.issue-type-dropdown-container')) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const execEditorCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const res = await apiUploadFile(file);
          if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertImage', false, res.url);
            setDescription(editorRef.current.innerHTML);
          }
        } catch (err: any) {
          showToast(err.message || 'Image upload failed', 'error');
        }
      }
    };
    input.click();
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const res = await apiUploadFile(file);
          if (editorRef.current) {
            editorRef.current.focus();
            const linkHtml = `<a href="${res.url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 600;">📎 ${res.originalName}</a>&nbsp;`;
            document.execCommand('insertHTML', false, linkHtml);
            setDescription(editorRef.current.innerHTML);
          }
        } catch (err: any) {
          showToast(err.message || 'File upload failed', 'error');
        }
      }
    };
    input.click();
  };

  const commentEditorRef = React.useRef<HTMLDivElement>(null);

  const execCommentEditorCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (commentEditorRef.current) {
      setNewComment(commentEditorRef.current.innerHTML);
    }
  };

  const handleCommentImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const res = await apiUploadFile(file);
          if (commentEditorRef.current) {
            commentEditorRef.current.focus();
            document.execCommand('insertImage', false, res.url);
            setNewComment(commentEditorRef.current.innerHTML);
          }
        } catch (err: any) {
          showToast(err.message || 'Image upload failed', 'error');
        }
      }
    };
    input.click();
  };

  const handleCommentFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const res = await apiUploadFile(file);
          if (commentEditorRef.current) {
            commentEditorRef.current.focus();
            const linkHtml = `<a href="${res.url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 600;">📎 ${res.originalName}</a>&nbsp;`;
            document.execCommand('insertHTML', false, linkHtml);
            setNewComment(commentEditorRef.current.innerHTML);
          }
        } catch (err: any) {
          showToast(err.message || 'File upload failed', 'error');
        }
      }
    };
    input.click();
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setTag(task.tag);
      setAssigneeId(task.assigneeId || '');
      setDate(task.date || '');
      setPriority(task.priority || 'medium');
      setEpicId(task.epicId || '');
      setSelectedTags(task.tags || []);
      setType(task.type || 'TASK');
      if (editorRef.current) {
        editorRef.current.innerHTML = task.description || '';
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || 'todo');
      setTag(workspaces[0]?.workspaceKey || '');
      setAssigneeId('');
      setDate(todayStr());
      setPriority('medium');
      setEpicId('');
      setSelectedTags([]);
      setType('TASK');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
    setNewTagInput('');
    setNewComment('');
    if (commentEditorRef.current) {
      commentEditorRef.current.innerHTML = '';
    }
    setConfirmDelete(false);
    setCreateAnother(false);
    setIsTypeDropdownOpen(false);
  }, [task, defaultStatus, isOpen, workspaces]);

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
      epicId: epicId || null,
      tags: selectedTags,
      type,
    };

    if (task) {
      updateTask(task.id, payload);
      onClose();
    } else {
      addTask(payload);
      if (createAnother) {
        setTitle('');
        setDescription('');
        setSelectedTags([]);
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      } else {
        onClose();
      }
    }
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    onClose();
  };

  const handleAddComment = () => {
    if (!task || !newComment.trim() || newComment === '<br>' || newComment === '<div><br></div>') return;
    addComment(task.id, newComment.trim(), CURRENT_USER);
    setNewComment('');
    if (commentEditorRef.current) {
      commentEditorRef.current.innerHTML = '';
    }
  };

  const comments = liveTask?.comments ?? [];
  const selectedTypeObj = ISSUE_TYPES.find(i => i.value === type) || ISSUE_TYPES[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="task-modal-title" className="w-full max-w-4xl">
      <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Atlassian Top Header */}
        <div className="px-6 py-4.5 border-b border-border-primary/50 flex items-center justify-between bg-bg-secondary">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary/70">{selectedTypeObj.icon}</span>
            <h3 id="task-modal-title" className="font-semibold text-text-heading text-base">
              {task ? `Edit Issue: ${task.ticketKey || ''}` : 'Create issue'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-text-secondary hover:text-text-heading p-1.5 rounded transition-colors cursor-pointer" title="Help">
              <HelpCircle size={16} />
            </button>
            <button className="text-text-secondary hover:text-text-heading p-1.5 rounded transition-colors cursor-pointer" title="Maximize">
              <Maximize2 size={15} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-text-secondary hover:text-text-heading p-1.5 rounded transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body - Two Column Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 grid grid-cols-12 gap-6 text-xs">

          {/* Left Column: Core Content */}
          <div className="col-span-12 md:col-span-8 space-y-5">

            {/* Project & Issue Type Selectors (Top Row) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-tag" className="text-text-secondary font-semibold block mb-1.5">Project *</label>
                <div className="relative">
                  <select
                    id="task-tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary hover:border-text-secondary/35 focus:border-blue-500 rounded px-3 py-2 text-text-primary font-medium outline-none transition-all cursor-pointer appearance-none"
                  >
                    {workspaces.map(w => (
                      <option key={w.id} value={w.workspaceKey}>
                        {w.name} ({w.workspaceKey})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-text-secondary pointer-events-none" />
                </div>
              </div>

              <div className="issue-type-dropdown-container">
                <label className="text-text-secondary font-semibold block mb-1.5">Issue Type *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full flex items-center justify-between bg-bg-primary border border-border-primary hover:border-text-secondary/35 focus:border-blue-500 rounded px-3 py-2 text-text-primary font-medium outline-none transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {selectedTypeObj.icon}
                      <span>{selectedTypeObj.label}</span>
                    </div>
                    <ChevronDown size={14} className="text-text-secondary" />
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-bg-primary border border-border-primary rounded shadow-lg z-50 overflow-hidden">
                      {ISSUE_TYPES.map(i => (
                        <button
                          key={i.value}
                          type="button"
                          onClick={() => {
                            setType(i.value);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary text-left transition-colors text-text-primary cursor-pointer ${type === i.value ? 'bg-blue-500/10' : ''
                            }`}
                        >
                          {i.icon}
                          <span className={type === i.value ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}>
                            {i.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-border-primary/40 my-1" />

            {/* Summary Title (Jira Style) */}
            <div className="space-y-1">
              <label htmlFor="task-title" className="text-text-secondary font-semibold block">Summary *</label>
              <input
                id="task-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Optimize ML model metrics"
                className="w-full bg-bg-primary border border-border-primary focus:border-blue-500 rounded px-3 py-2 text-text-primary text-sm font-medium outline-none transition-all"
              />
            </div>

            {/* Description Editor Panel */}
            <div className="space-y-1">
              <label htmlFor="task-desc" className="text-text-secondary font-semibold block">Description</label>
              <div className="border border-border-primary rounded bg-bg-primary overflow-hidden focus-within:border-blue-500 transition-all">
                {/* Editor Toolbar */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border-primary/50 bg-bg-secondary/40 text-text-secondary">
                  <button type="button" onClick={() => execEditorCommand('bold')} className="p-1 hover:bg-bg-tertiary rounded font-bold cursor-pointer text-[10px]" title="Bold"><Bold size={13} /></button>
                  <button type="button" onClick={() => execEditorCommand('italic')} className="p-1 hover:bg-bg-tertiary rounded italic cursor-pointer text-[10px]" title="Italic"><Italic size={13} /></button>
                  <button type="button" onClick={() => execEditorCommand('createLink', prompt('Enter URL:') || '')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Link"><Link2 size={13} /></button>
                  <button type="button" onClick={() => execEditorCommand('formatBlock', 'pre')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Code"><Code size={13} /></button>
                  <button type="button" onClick={() => execEditorCommand('insertUnorderedList')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Bullet List"><List size={13} /></button>
                  <button type="button" onClick={() => execEditorCommand('insertOrderedList')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Numbered List"><ListOrdered size={13} /></button>
                  <button type="button" onClick={handleImageUpload} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Insert Image"><Image size={13} /></button>
                  <button type="button" onClick={handleFileUpload} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Attach File"><Paperclip size={13} /></button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                  className="w-full bg-transparent border-0 px-3 py-2.5 text-text-primary outline-none min-h-[150px] max-h-[300px] overflow-y-auto leading-relaxed"
                  style={{ outline: 'none' }}
                />
              </div>
            </div>

            {/* Comments Section (Jira style bottom area) */}
            {task && (
              <div className="border-t border-border-primary/40 pt-4.5 space-y-3">
                <span className="text-text-secondary font-semibold block text-xs">Activity Comments ({comments.length})</span>
                <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                  {comments.length === 0 && (
                    <p className="text-text-secondary/60 italic">No comments yet. Start the discussion below.</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 border border-purple-500/20">
                        {c.author.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px]">
                          <span className="font-bold text-text-heading">{c.author}</span>
                          <span className="text-text-secondary/60 ml-2">{relativeTime(c.createdAt)}</span>
                        </p>
                        <p className="text-text-primary mt-0.5 leading-relaxed break-words text-[11px] task-description" dangerouslySetInnerHTML={{ __html: c.text }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="border border-border-primary rounded bg-bg-primary overflow-hidden focus-within:border-blue-500 transition-all">
                    {/* Mini Editor Toolbar for Comments */}
                    <div className="flex items-center gap-1.5 px-3 py-1 border-b border-border-primary/50 bg-bg-secondary/40 text-text-secondary">
                      <button type="button" onClick={() => execCommentEditorCommand('bold')} className="p-1 hover:bg-bg-tertiary rounded font-bold cursor-pointer text-[10px]" title="Bold"><Bold size={11} /></button>
                      <button type="button" onClick={() => execCommentEditorCommand('italic')} className="p-1 hover:bg-bg-tertiary rounded italic cursor-pointer text-[10px]" title="Italic"><Italic size={11} /></button>
                      <button type="button" onClick={() => execCommentEditorCommand('createLink', prompt('Enter URL:') || '')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Link"><Link2 size={11} /></button>
                      <button type="button" onClick={() => execCommentEditorCommand('formatBlock', 'pre')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Code"><Code size={11} /></button>
                      <button type="button" onClick={() => execCommentEditorCommand('insertUnorderedList')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Bullet List"><List size={11} /></button>
                      <button type="button" onClick={() => execCommentEditorCommand('insertOrderedList')} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Numbered List"><ListOrdered size={11} /></button>
                      <button type="button" onClick={handleCommentImageUpload} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Insert Image"><Image size={11} /></button>
                      <button type="button" onClick={handleCommentFileUpload} className="p-1 hover:bg-bg-tertiary rounded cursor-pointer" title="Attach File"><Paperclip size={11} /></button>
                    </div>
                    <div
                      ref={commentEditorRef}
                      contentEditable
                      onInput={(e) => setNewComment(e.currentTarget.innerHTML)}
                      className="w-full bg-transparent border-0 px-3 py-2 text-text-primary outline-none min-h-[50px] max-h-[120px] overflow-y-auto leading-relaxed text-[11.5px]"
                      style={{ outline: 'none' }}
                      data-placeholder="Add a comment…"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || newComment === '<br>' || newComment === '<div><br></div>'}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-semibold rounded px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Send</span>
                      <Send size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata Sidebar */}
          <div className="col-span-12 md:col-span-4 bg-bg-secondary/20 p-4 border border-border-primary/50 rounded-lg space-y-4">

            {/* Status */}
            <div>
              <label htmlFor="task-status" className="text-text-secondary font-semibold block mb-1">Status</label>
              <div className="relative">
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                  className="w-full bg-bg-primary border border-border-primary hover:border-text-secondary/35 focus:border-blue-500 rounded px-3 py-2 text-text-primary font-medium outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="todo">To Do</option>
                  <option value="doing">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="task-assignee" className="text-text-secondary font-semibold block">Assignee</label>
                <button
                  type="button"
                  onClick={() => {
                    const me = users.find(u => u.name.includes('Tejas') || u.email.includes('tejas'));
                    if (me) setAssigneeId(me.id);
                  }}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                >
                  Assign to me
                </button>
              </div>
              <div className="relative">
                <select
                  id="task-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary hover:border-text-secondary/35 focus:border-blue-500 rounded px-3 py-2 text-text-primary font-medium outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Reporter (Read-only Current User) */}
            <div>
              <label className="text-text-secondary font-semibold block mb-1">Reporter</label>
              <div className="w-full bg-bg-primary/50 border border-border-primary/50 rounded px-3 py-2 text-text-secondary font-medium">
                {CURRENT_USER}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="text-text-secondary font-semibold block mb-1">Priority</label>
              <div className="relative">
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-bg-primary border border-border-primary hover:border-text-secondary/35 focus:border-blue-500 rounded px-3 py-2 text-text-primary font-medium outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="task-date" className="text-text-secondary font-semibold block mb-1">Due Date</label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-primary border border-border-primary focus:border-blue-500 rounded px-3 py-2 text-text-primary outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Parent Epic Link */}
            <div>
              <label htmlFor="task-epic" className="text-text-secondary font-semibold block mb-1">Epic Link</label>
              <div className="relative">
                <select
                  id="task-epic"
                  value={epicId}
                  onChange={(e) => setEpicId(e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary hover:border-text-secondary/35 focus:border-blue-500 rounded px-3 py-2 text-text-primary font-medium outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="">No Epic Link</option>
                  {epics.map(e => (
                    <option key={e.id} value={e.id}>
                      [{e.ticketKey}] {e.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Dynamic Tags */}
            <div className="space-y-2 pt-2 border-t border-border-primary/30">
              <label className="text-text-secondary font-semibold block">Labels</label>

              {/* Active Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {selectedTags.map(tagLabel => {
                    const colors = getTagColorClass(tagLabel);
                    return (
                      <span
                        key={tagLabel}
                        className={`flex items-center gap-1 border ${colors.bg} ${colors.border} ${colors.text} rounded px-1.5 py-0.5 text-[9px] font-bold shadow-sm uppercase`}
                      >
                        <span>{tagLabel}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTags(prev => prev.filter(t => t !== tagLabel))}
                          className="hover:opacity-75 transition-opacity cursor-pointer"
                          aria-label={`Remove tag ${tagLabel}`}
                        >
                          <X size={9} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Suggestions / Available Tags */}
              {availableTags.length > 0 ? (
                <div className="space-y-1">
                  <span className="text-[9px] text-text-secondary/70 block">Available Labels:</span>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.map(tagLabel => {
                      const isSelected = selectedTags.includes(tagLabel);
                      const colors = getTagColorClass(tagLabel);
                      return (
                        <button
                          key={tagLabel}
                          type="button"
                          onClick={() => {
                            setSelectedTags(prev =>
                              prev.includes(tagLabel)
                                ? prev.filter(t => t !== tagLabel)
                                : [...prev, tagLabel]
                            );
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer uppercase ${isSelected
                              ? `${colors.bg} ${colors.border} ${colors.text}`
                              : 'bg-bg-primary border-border-primary text-text-secondary hover:border-text-secondary/40'
                            }`}
                        >
                          {tagLabel} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-text-secondary/60 italic">No labels created yet.</p>
              )}

              <div className="flex items-center gap-1 mt-2">
                <input
                  type="text"
                  placeholder="Add custom label..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = newTagInput.trim();
                      if (val) {
                        await createAvailableTag(val);
                        setSelectedTags(prev => prev.includes(val) ? prev : [...prev, val]);
                        setNewTagInput('');
                      }
                    }
                  }}
                  className="flex-1 bg-bg-primary border border-border-primary focus:border-blue-500 rounded px-2 py-1 text-text-primary text-[10px] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const val = newTagInput.trim();
                    if (val) {
                      await createAvailableTag(val);
                      setSelectedTags(prev => prev.includes(val) ? prev : [...prev, val]);
                      setNewTagInput('');
                    }
                  }}
                  className="px-2 py-1 rounded bg-bg-primary border border-border-primary hover:border-text-secondary/45 text-text-primary text-[10px] font-bold cursor-pointer transition-all"
                >
                  + Add
                </button>
              </div>
            </div>

          </div>

        </form>

        {/* Footer Actions (Atlassian Style) */}
        <div className="px-6 py-4 bg-bg-secondary border-t border-border-primary/50 flex items-center justify-between">
          <div className="flex items-center">
            {/* Create Another Checkbox (Creation Mode only) */}
            {!task && (
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={(e) => setCreateAnother(e.target.checked)}
                  className="rounded border-border-primary text-blue-600 focus:ring-blue-500/50 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Create another</span>
              </label>
            )}

            {/* Delete button (Edit Mode only) */}
            {task && (
              <div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded px-3 py-1.5 font-bold transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Delete Issue
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                      <AlertTriangle size={13} /> Delete?
                    </span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded px-2.5 py-1 font-bold transition-colors cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-text-secondary hover:text-text-heading font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent hover:bg-bg-tertiary text-text-secondary hover:text-text-heading rounded px-4 py-2 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded px-4 py-2 font-bold shadow transition-colors cursor-pointer"
            >
              {task ? 'Save' : 'Create'}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
