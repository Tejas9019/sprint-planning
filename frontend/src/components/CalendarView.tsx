import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Pin, 
  PinOff, 
  X, 
  CheckSquare, 
  StickyNote,
  SlidersHorizontal,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useBoardStore, type Task } from '../store/boardStore';
import { daysFromTodayStr, getToday, isTodayStr, parseDateStr } from '../utils/date';
import { Modal } from './ui/Modal';

// Color definitions for Sticky Notes
const NOTE_COLORS = [
  { name: 'yellow', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/40 hover:bg-amber-150' },
  { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800/40 hover:bg-purple-150' },
  { name: 'blue', bg: 'bg-blue-100 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800/40 hover:bg-blue-150' },
  { name: 'green', bg: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-150' }
];

const getNoteStyles = (color: string, isDark: boolean) => {
  switch (color) {
    case 'yellow':
      return {
        bg: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fef7e0',
        border: isDark ? 'rgba(217, 119, 6, 0.3)' : '#fbe089',
        text: isDark ? '#fef08a' : '#b06000'
      };
    case 'purple':
      return {
        bg: isDark ? 'rgba(147, 51, 234, 0.15)' : '#f3e8ff',
        border: isDark ? 'rgba(147, 51, 234, 0.3)' : '#d8b4fe',
        text: isDark ? '#f3e8ff' : '#6b21a8'
      };
    case 'blue':
      return {
        bg: isDark ? 'rgba(37, 99, 235, 0.15)' : '#e8f0fe',
        border: isDark ? 'rgba(37, 99, 235, 0.3)' : '#aecbfa',
        text: isDark ? '#dbeafe' : '#1a73e8'
      };
    case 'green':
      return {
        bg: isDark ? 'rgba(5, 150, 105, 0.15)' : '#e6f4ea',
        border: isDark ? 'rgba(5, 150, 105, 0.3)' : '#a8dab5',
        text: isDark ? '#d1fae5' : '#137333'
      };
    default:
      return {
        bg: isDark ? 'rgba(147, 51, 234, 0.15)' : '#e8f0fe',
        border: isDark ? 'rgba(147, 51, 234, 0.3)' : '#aecbfa',
        text: isDark ? '#dbeafe' : '#1a73e8'
      };
  }
};

const getTaskStyles = (status: Task['status'], isDark: boolean) => {
  switch (status) {
    case 'done':
      return {
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#e6f4ea',
        border: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a8dab5',
        text: isDark ? '#34d399' : '#137333'
      };
    case 'doing':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef7e0',
        border: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fbe089',
        text: isDark ? '#fbbf24' : '#b06000'
      };
    default: // todo
      return {
        bg: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e8f0fe',
        border: isDark ? 'rgba(99, 102, 241, 0.3)' : '#aecbfa',
        text: isDark ? '#818cf8' : '#1a73e8'
      };
  }
};

export interface CalendarNote {
  id: string;
  type: 'note';
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  color: string; // yellow, purple, blue, green
  pinned: boolean;
}

interface CalendarViewProps {
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onEditTask }) => {
  const { tasks, addTask, deleteTask, theme } = useBoardStore();
  const isDark = theme === 'dark';

  // Selected date context for month/year view
  const [currentDate, setCurrentDate] = useState(getToday()); // anchored to the real current month
  const [selectedCellDate, setSelectedCellDate] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'notes'>('all');

  // Sticky notes local storage persistence
  const [notes, setNotes] = useState<CalendarNote[]>(() => {
    const saved = localStorage.getItem('sprint_calendar_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse calendar notes", e);
      }
    }
    return [
      {
        id: 'n1',
        type: 'note',
        title: 'Review Sprint Deliverables',
        description: 'Prepare checklist for final review and verification.',
        date: daysFromTodayStr(0),
        color: 'yellow',
        pinned: true
      },
      {
        id: 'n2',
        type: 'note',
        title: 'Team sync note',
        description: 'Mention new feature deadlines during standard morning catch-up.',
        date: daysFromTodayStr(-1),
        color: 'purple',
        pinned: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sprint_calendar_notes', JSON.stringify(notes));
  }, [notes]);

  // Modal creation states
  const [modalMode, setModalMode] = useState<'view' | 'add-task' | 'add-note'>('view');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('yellow');
  const [newPinned, setNewPinned] = useState(false);
  const [newTaskTag, setNewTaskTag] = useState('AI Writer');
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('todo');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper calendar calculations (Monday-based start)
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust Monday to be index 0
  };

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Month labels
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate the 42 cells representing the calendar grid
  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    cells.push({ dateStr, dayNum: dNum, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    cells.push({ dateStr, dayNum: i, isCurrentMonth: true });
  }

  // Next month leading days to round out to 42 cells
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    cells.push({ dateStr, dayNum: i, isCurrentMonth: false });
  }

  // Handle cell click
  const handleCellClick = (dateStr: string) => {
    setSelectedCellDate(dateStr);
    setModalMode('view');
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    resetForm();
  };

  // Add Item actions
  const handleAddNote = () => {
    if (!newTitle.trim() || !selectedCellDate) return;
    const newNote: CalendarNote = {
      id: `note_${Date.now()}`,
      type: 'note',
      title: newTitle,
      description: newDesc,
      date: selectedCellDate,
      color: newColor,
      pinned: newPinned
    };
    setNotes([...notes, newNote]);
    resetForm();
    setModalMode('view');
  };

  const handleAddTask = () => {
    if (!newTitle.trim() || !selectedCellDate) return;
    addTask({
      title: newTitle,
      description: newDesc,
      status: newTaskStatus,
      tag: newTaskTag,
      assigneeId: null,
      date: selectedCellDate
    });
    resetForm();
    setModalMode('view');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewColor('yellow');
    setNewPinned(false);
    setNewTaskTag('AI Writer');
    setNewTaskStatus('todo');
  };

  // Filter tasks & notes based on filters
  const getCellItems = (dateStr: string) => {
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const dayNotes = notes.filter(n => n.date === dateStr);

    let items: (Task | CalendarNote)[] = [];
    if (filterType === 'all' || filterType === 'tasks') {
      items = [...items, ...dayTasks];
    }
    if (filterType === 'all' || filterType === 'notes') {
      // Sort pinned notes to the top
      const sortedNotes = [...dayNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      items = [...items, ...sortedNotes];
    }
    return items;
  };

  const selectedItems = selectedCellDate ? getCellItems(selectedCellDate) : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Calendar SubHeader Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 select-none">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-text-heading uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon size={16} className="text-purple-500" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1 bg-bg-secondary border border-border-primary/50 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentDate(getToday())}
              className="px-2 py-0.5 text-[10px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <SlidersHorizontal size={12} className="text-text-secondary mr-1.5" />
          {(['all', 'tasks', 'notes'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10'
                  : 'bg-bg-secondary border border-border-primary/60 text-text-secondary hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center select-none border-b border-border-primary/50 pb-1 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-[11px] font-bold text-text-secondary uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid of Cells */}
      <div className="flex-grow grid grid-cols-7 grid-rows-6 border-t border-l border-border-primary rounded-xl overflow-hidden min-h-[450px]">
        {cells.map(({ dateStr, dayNum, isCurrentMonth }) => {
          const items = getCellItems(dateStr);
          const isToday = isTodayStr(dateStr); // real current day

          return (
            <div
              key={dateStr}
              role="button"
              tabIndex={0}
              aria-label={`${parseDateStr(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${items.length ? `, ${items.length} item${items.length > 1 ? 's' : ''}` : ', no items'}`}
              onClick={() => handleCellClick(dateStr)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(dateStr);
                }
              }}
              className={`bg-bg-secondary border-r border-b border-border-primary p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer group relative hover:bg-bg-tertiary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500/50 ${
                isCurrentMonth ? '' : 'opacity-40 bg-bg-primary/40'
              }`}
            >
              {/* Cell Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday
                    ? 'bg-[#1a73e8] text-white font-bold'
                    : 'text-text-primary hover:bg-bg-tertiary'
                }`}>
                  {dayNum}
                </span>

                {/* Hidden Quick Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCellDate(dateStr);
                    setModalMode('add-note');
                    setIsDetailModalOpen(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 w-5 h-5 rounded-full hover:bg-bg-tertiary text-text-secondary flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Add note or task to this day"
                  title="Add note/task"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Items List inside cell */}
              <div className="flex-1 mt-1.5 overflow-y-auto space-y-1 scrollbar-none max-h-[85px]">
                {items.slice(0, 3).map(item => {
                  const isTask = !('type' in item);
                  if (!isTask) {
                    const note = item as CalendarNote;
                    const noteStyle = getNoteStyles(note.color, isDark);
                    return (
                      <div
                        key={note.id}
                        style={{ backgroundColor: noteStyle.bg, color: noteStyle.text, borderColor: noteStyle.border }}
                        className="text-[10px] px-2 py-0.5 rounded border font-medium truncate flex items-center gap-1 transition-all"
                        title={`${note.title}: ${note.description}`}
                      >
                        {note.pinned && <Pin size={8} className="rotate-45 flex-shrink-0" />}
                        <span className="truncate">{note.title}</span>
                      </div>
                    );
                  } else {
                    const task = item as Task;
                    const taskStyle = getTaskStyles(task.status, isDark);
                    return (
                      <div
                        key={task.id}
                        style={{ backgroundColor: taskStyle.bg, color: taskStyle.text, borderColor: taskStyle.border }}
                        className="text-[10px] px-2 py-0.5 rounded border font-bold truncate flex items-center gap-1 transition-all"
                        title={`[Task] ${task.title}`}
                      >
                        <CheckSquare size={8} className="flex-shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  }
                })}

                {/* More count indicator */}
                {items.length > 3 && (
                  <div className="text-[9px] text-blue-600 dark:text-blue-400 font-bold pl-1.5 py-0.5 select-none">
                    {items.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Detail & Create Modal */}
      {isDetailModalOpen && selectedCellDate && (
        <Modal isOpen onClose={closeModal} labelledBy="cal-modal-title" className="w-full max-w-md">
          <div className="bg-bg-secondary border border-border-primary rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border-primary/50 flex items-center justify-between bg-bg-secondary select-none">
              <div>
                <h3 id="cal-modal-title" className="text-xs font-bold text-text-secondary uppercase tracking-widest">Schedule Planner</h3>
                <p className="text-sm font-semibold text-text-heading mt-0.5">
                  {parseDateStr(selectedCellDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close dialog"
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-tertiary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[350px] overflow-y-auto space-y-4">
              {modalMode === 'view' ? (
                <>
                  {/* Create Options Header */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalMode('add-note')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/25 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <StickyNote size={14} />
                      Add Sticky Note
                    </button>
                    <button
                      onClick={() => setModalMode('add-task')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <CheckSquare size={14} />
                      Add Task Card
                    </button>
                  </div>

                  {/* Scheduled Items List */}
                  <div className="space-y-2 mt-2">
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Scheduled Items ({selectedItems.length})</h4>
                    
                    {selectedItems.length === 0 ? (
                      <div className="text-center py-6 text-xs text-text-secondary/60 border border-dashed border-border-primary rounded-xl">
                        Nothing scheduled for this date.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedItems.map(item => {
                          const isTask = !('type' in item);
                          if (!isTask) {
                            const note = item as CalendarNote;
                            const noteStyle = getNoteStyles(note.color, isDark);
                            return (
                              <div
                                key={note.id}
                                style={{ backgroundColor: noteStyle.bg, color: noteStyle.text, borderColor: noteStyle.border }}
                                className="p-3 rounded-xl border flex flex-col justify-between shadow-sm relative group/note transition-all"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-bold text-xs">
                                      {note.pinned && <Pin size={10} className="rotate-45 text-text-primary" />}
                                      <span className="truncate">{note.title}</span>
                                    </div>
                                    <p className="text-[10px] opacity-80 mt-1 font-medium leading-relaxed">{note.description || 'No description'}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => togglePinNote(note.id)}
                                      aria-label={note.pinned ? `Unpin note: ${note.title}` : `Pin note: ${note.title}`}
                                      aria-pressed={note.pinned}
                                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-primary hover:text-purple-600 cursor-pointer"
                                      title={note.pinned ? "Unpin Note" : "Pin Note"}
                                    >
                                      {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      aria-label={`Delete note: ${note.title}`}
                                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-red-600 cursor-pointer"
                                      title="Delete Note"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            const task = item as Task;
                            return (
                              <div
                                key={task.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`Edit task: ${task.title}`}
                                onClick={() => {
                                  setIsDetailModalOpen(false);
                                  onEditTask(task);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setIsDetailModalOpen(false);
                                    onEditTask(task);
                                  }
                                }}
                                className="p-3 bg-bg-secondary border border-border-primary hover:border-purple-500/30 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-bg-tertiary/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                    task.status === 'done'
                                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'border-border-primary bg-bg-primary'
                                  }`}>
                                    {task.status === 'done' && (
                                      <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-text-heading truncate">{task.title}</p>
                                    <span className="inline-block mt-0.5 text-[8px] font-bold text-text-secondary bg-bg-tertiary border border-border-primary/50 rounded-full px-1.5">
                                      {task.tag}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className={`text-[8px] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5 border ${
                                    task.status === 'done' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' :
                                    task.status === 'doing' ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' :
                                    'border-indigo-500/20 bg-indigo-500/5 text-indigo-500'
                                  }`}>
                                    {task.status === 'doing' ? 'doing' : task.status === 'done' ? 'done' : 'to do'}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTask(task.id);
                                    }}
                                    aria-label={`Delete task: ${task.title}`}
                                    className="p-1 hover:bg-bg-tertiary rounded text-red-500 cursor-pointer"
                                    title="Delete Task"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : modalMode === 'add-note' ? (
                /* Sticky Note Creator Form */
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-text-heading flex items-center gap-1.5">
                    <StickyNote size={14} className="text-purple-500" />
                    New Sticky Note
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Title</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Note header..."
                        className="w-full mt-1 px-3 py-2 bg-bg-primary border border-border-primary/80 focus:border-purple-500 rounded-lg text-xs outline-none text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Description</label>
                      <textarea
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="Write note content here..."
                        rows={3}
                        className="w-full mt-1 px-3 py-2 bg-bg-primary border border-border-primary/80 focus:border-purple-500 rounded-lg text-xs outline-none text-text-primary resize-none"
                      />
                    </div>
                    
                    {/* Color picker */}
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1.5">Post-it Color</label>
                      <div className="flex gap-2">
                        {NOTE_COLORS.map(c => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setNewColor(c.name)}
                            aria-label={`${c.name} note color`}
                            aria-pressed={newColor === c.name}
                            className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                              newColor === c.name ? 'ring-2 ring-purple-600 scale-105 border-transparent' : 'border-border-primary'
                            } ${
                              c.name === 'yellow' ? 'bg-amber-200' :
                              c.name === 'purple' ? 'bg-purple-200' :
                              c.name === 'blue' ? 'bg-blue-200' : 'bg-emerald-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Pin checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary py-1 select-none">
                      <input
                        type="checkbox"
                        checked={newPinned}
                        onChange={e => setNewPinned(e.target.checked)}
                        className="rounded border-border-primary text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                      />
                      <span>Pin Note to Top</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2 select-none">
                    <button
                      onClick={() => setModalMode('view')}
                      className="flex-1 py-2 rounded-xl bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/70 text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!newTitle.trim()}
                      className="flex-1 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                    >
                      Create Note
                    </button>
                  </div>
                </div>
              ) : (
                /* Task Creator Form */
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-text-heading flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-indigo-500" />
                    New Task Card
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Title</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Task title..."
                        className="w-full mt-1 px-3 py-2 bg-bg-primary border border-border-primary/80 focus:border-indigo-500 rounded-lg text-xs outline-none text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Description</label>
                      <textarea
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="Describe task details..."
                        rows={2}
                        className="w-full mt-1 px-3 py-2 bg-bg-primary border border-border-primary/80 focus:border-indigo-500 rounded-lg text-xs outline-none text-text-primary resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Project Tag</label>
                        <select
                          value={newTaskTag}
                          onChange={e => setNewTaskTag(e.target.value)}
                          className="w-full px-2 py-1.5 bg-bg-primary border border-border-primary/80 rounded-lg text-xs outline-none text-text-primary"
                        >
                          <option value="AI Writer">AI Writer</option>
                          <option value="Sentiment AI">Sentiment AI</option>
                          <option value="Sales Forecast">Sales Forecast</option>
                          <option value="Social Boost">Social Boost</option>
                          <option value="Lead Scoring">Lead Scoring</option>
                          <option value="Data Insights">Data Insights</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Status</label>
                        <select
                          value={newTaskStatus}
                          onChange={e => setNewTaskStatus(e.target.value as Task['status'])}
                          className="w-full px-2 py-1.5 bg-bg-primary border border-border-primary/80 rounded-lg text-xs outline-none text-text-primary"
                        >
                          <option value="todo">To Do</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 select-none">
                    <button
                      onClick={() => setModalMode('view')}
                      className="flex-1 py-2 rounded-xl bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/70 text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddTask}
                      disabled={!newTitle.trim()}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                    >
                      Create Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
