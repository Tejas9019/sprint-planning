import React from 'react';
import { MessageSquare, CalendarClock } from 'lucide-react';
import { useBoardStore, type Task, type Priority } from '../store/boardStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isOverdue, parseDateStr } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  isOverlay?: boolean;
}

// Translucent, dual-theme tag chips so they read well in both light and dark.
const TAG_COLORS: Record<string, string> = {
  'Sales Forecast': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'Sentiment AI': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'Task Automate': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'Script AI': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'Lead Scoring': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  'Heatmap AI': 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
  'Social Boost': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  'AI Writer': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  'Data Insights': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'Predictive AI': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
};

const PRIORITY_META: Record<Priority, { label: string; dot: string; text: string }> = {
  high: { label: 'High priority', dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  medium: { label: 'Medium priority', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  low: { label: 'Low priority', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
};

// Generates a nice background color for user initials
const getUserColor = (userId: string) => {
  const colors = [
    'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30',
    'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
    'bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30'
  ];
  const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

const formatDue = (dateStr: string) =>
  parseDateStr(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, isOverlay = false }) => {
  const { users } = useBoardStore();
  const assignee = users.find(u => u.id === task.assigneeId);

  // dnd-kit sortable: supports both reordering within a column and moving across columns.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isOverlay,
    data: { status: task.status },
  });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // If dragging, we render a dashed ghost outline that retains the exact layout size of the card
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={sortableStyle}
        className="bg-bg-secondary/10 border-2 border-dashed border-purple-500/20 dark:border-purple-500/30 rounded-xl p-3.5 space-y-3 opacity-25 shadow-none pointer-events-none select-none"
      >
        <div className="invisible">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold border">{task.tag}</span>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold">{task.title}</h4>
            {task.description && <p className="text-[10px]">{task.description}</p>}
          </div>
          {task.status === 'done' && task.imageUrl && (
            <div className="h-28" />
          )}
          <div className="flex items-center justify-between pt-1 border-t border-border-primary/30">
            <div className="h-4" />
          </div>
        </div>
      </div>
    );
  }

  const tagClass = TAG_COLORS[task.tag] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
  const priority = task.priority ? PRIORITY_META[task.priority] : null;
  const overdue = isOverdue(task.date, task.status);

  // Get Initials for assignee
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const dragProps = isOverlay ? {} : { ...listeners, ...attributes };

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? undefined : sortableStyle}
      {...dragProps}
      role={onEdit && !isOverlay ? 'button' : undefined}
      tabIndex={onEdit && !isOverlay ? 0 : undefined}
      aria-label={onEdit && !isOverlay ? `Edit task: ${task.title}` : undefined}
      onClick={() => {
        if (isOverlay || !onEdit) return;
        onEdit(task);
      }}
      onKeyDown={(e) => {
        if (isOverlay || !onEdit) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(task);
        }
      }}
      className={`group bg-bg-secondary border border-border-primary rounded-xl p-3.5 space-y-3 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
        isOverlay
          ? 'transition-none cursor-grabbing rotate-[2.5deg] scale-[1.04] border-purple-500/40 shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/40 backdrop-blur-md bg-bg-secondary/90 ring-1 ring-purple-500/10'
          : 'transition-shadow duration-200 cursor-grab active:cursor-grabbing hover:border-text-secondary/30 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Card Tag + priority */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tagClass}`}>
          {task.tag}
        </span>
        {priority && (
          <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide ${priority.text}`} title={priority.label}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} aria-hidden="true" />
            {task.priority}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-text-heading group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Done Image (if applicable) */}
      {task.status === 'done' && task.imageUrl && (
        <div className="relative rounded-lg overflow-hidden border border-border-primary/50 h-28 bg-bg-primary">
          <img
            src={task.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      )}

      {/* Card Footer: due date, comments & assignee */}
      <div className="flex items-center justify-between pt-1 text-text-secondary border-t border-border-primary/30">
        <div className="flex items-center gap-3 text-[10px]">
          {task.date && (
            <span
              className={`flex items-center gap-1 ${overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}
              title={overdue ? 'Overdue' : 'Due date'}
            >
              <CalendarClock size={12} />
              <span>{overdue ? `Overdue · ${formatDue(task.date)}` : formatDue(task.date)}</span>
            </span>
          )}
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
              <MessageSquare size={12} />
              <span>{task.commentsCount}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div>
          {assignee ? (
            <div
              title={assignee.name}
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-bold border border-bg-secondary shadow-inner ${getUserColor(assignee.id)}`}
            >
              {getInitials(assignee.name)}
            </div>
          ) : (
            <div
              title="Unassigned"
              className="w-5.5 h-5.5 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center text-[9px] text-text-secondary/60"
            >
              --
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
