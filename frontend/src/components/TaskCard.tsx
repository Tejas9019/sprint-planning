import React from 'react';
import { MessageSquare, CalendarClock, Bookmark, Bug, CheckSquare, Zap, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { useBoardStore, type Task, type Priority } from '../store/boardStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isOverdue, parseDateStr } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  isOverlay?: boolean;
}

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

export const getTagColorClass = (tag: string) => {
  const colors = [
    // Orange
    { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
    // Vibrant Green
    { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    // Violet
    { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    // Blue/Indigo
    { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    // Pink/Rose
    { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    // Teal
    { bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-200 dark:border-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
    // Amber/Yellow
    { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    // Indigo
    { bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
    // Cyan
    { bg: 'bg-cyan-50 dark:bg-cyan-950/20', border: 'border-cyan-200 dark:border-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
    // Lime
    { bg: 'bg-lime-50 dark:bg-lime-950/20', border: 'border-lime-200 dark:border-lime-900/30', text: 'text-lime-700 dark:text-lime-300' }
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const renderTypeIcon = (type?: string) => {
  const t = type?.toUpperCase() || 'TASK';
  switch (t) {
    case 'BUG':
      return <Bug size={13} className="text-rose-500 fill-rose-500/10" />;
    case 'EPIC':
      return <Zap size={13} className="text-purple-600 fill-purple-600" />;
    case 'STORY':
      return <Bookmark size={13} className="text-emerald-500 fill-emerald-500" />;
    case 'TASK':
    default:
      return <CheckSquare size={13} className="text-blue-500 fill-blue-500" />;
  }
};

const renderPriorityIcon = (priority?: string) => {
  const p = priority?.toLowerCase() || 'medium';
  switch (p) {
    case 'high':
      return <span title="High Priority"><ChevronUp size={14} className="text-rose-500 font-bold" /></span>;
    case 'low':
      return <span title="Low Priority"><ChevronDown size={14} className="text-emerald-500 font-bold" /></span>;
    case 'medium':
    default:
      return <span title="Medium Priority"><Minus size={14} className="text-amber-500 font-bold" /></span>;
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, isOverlay = false }) => {
  const { users, tasks } = useBoardStore();
  const assignee = users.find(u => u.id === task.assigneeId);
  const epic = task.epicId ? tasks.find(t => t.id === task.epicId) : null;

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
        className="bg-bg-secondary/10 border border-dashed border-purple-500/20 dark:border-purple-500/30 rounded-xl p-3.5 space-y-3 opacity-25 shadow-none pointer-events-none select-none"
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

  const overdue = isOverdue(task.date, task.status);
  const cardTags = task.tags || [];

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
      className={`group bg-bg-secondary border border-border-primary/50 rounded-lg p-3.5 space-y-3 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
        isOverlay
          ? 'transition-none cursor-grabbing rotate-[2.5deg] scale-[1.04] border-purple-500/40 shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/40 backdrop-blur-md bg-bg-secondary/90 ring-1 ring-purple-500/10'
          : 'transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-purple-500/30 hover:bg-bg-tertiary/10 shadow-sm'
      }`}
    >
      {/* Title & Epic Header */}
      <div className="space-y-1">
        {epic && (
          <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-purple-600 dark:text-purple-400 w-fit">
            <span>Parent:</span>
            <span className="truncate max-w-[120px]" title={`${epic.ticketKey} ${epic.title}`}>
              {epic.title}
            </span>
          </div>
        )}
        <h4 className="text-xs font-semibold text-text-heading group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-text-secondary/80 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Tags Chips */}
      {cardTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cardTags.map(tagLabel => {
            const colors = getTagColorClass(tagLabel);
            return (
              <span
                key={tagLabel}
                className={`border ${colors.bg} ${colors.border} ${colors.text} text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide uppercase`}
              >
                {tagLabel}
              </span>
            );
          })}
        </div>
      )}

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

      {/* Card Footer: Type icon, ticket key, priority, due date, comments, assignee */}
      <div className="flex items-center justify-between pt-1 text-text-secondary">
        <div className="flex items-center gap-2">
          {/* Issue Type Icon */}
          <span className="flex-shrink-0">
            {renderTypeIcon(task.type)}
          </span>

          {/* Ticket Key */}
          {task.ticketKey && (
            <span className="font-bold text-text-secondary/90 text-[11px] tracking-tight">
              {task.ticketKey}
            </span>
          )}

          {/* Priority Icon */}
          <span className="flex-shrink-0 ml-0.5">
            {renderPriorityIcon(task.priority)}
          </span>

          {/* Due date */}
          {task.date && (
            <span
              className={`flex items-center gap-0.5 text-[10px] ml-0.5 ${overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}
              title={overdue ? 'Overdue' : 'Due date'}
            >
              <CalendarClock size={11} />
              <span>{formatDue(task.date)}</span>
            </span>
          )}

          {/* Comments count */}
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] ml-0.5">
              <MessageSquare size={11} />
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
              className="w-5 h-5 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center text-[9px] text-text-secondary/60"
            >
              --
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
