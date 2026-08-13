import React, { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore, type Task } from '../store/boardStore';
import { TaskCard } from './TaskCard';
import { Plus, SlidersHorizontal, Star, FilterX } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { useClickAway } from '../hooks/useClickAway';

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
  onAddTask: (status: Task['status']) => void;
}

interface ColumnProps {
  id: Task['status'];
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (status: Task['status']) => void;
}

// ---------------------------------------------------------
// TABLE VIEW COMPONENT
// ---------------------------------------------------------
interface TableViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const TableView: React.FC<TableViewProps> = ({ tasks, onEditTask }) => {
  const { users } = useBoardStore();

  return (
    <div className="flex-1 overflow-auto bg-bg-secondary/40 border border-border-primary/50 rounded-2xl shadow-sm transition-colors duration-200">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border-primary text-text-secondary select-none font-semibold bg-bg-secondary/80">
            <th className="p-3.5">Task Title</th>
            <th className="p-3.5">Description</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Project Tag</th>
            <th className="p-3.5">Assignee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary/30">
          {tasks.map(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            return (
              <tr
                key={task.id}
                tabIndex={0}
                aria-label={`Edit task: ${task.title}`}
                onClick={() => onEditTask(task)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEditTask(task);
                  }
                }}
                className="hover:bg-bg-tertiary/40 transition-colors cursor-pointer text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500/50"
              >
                <td className="p-3.5 font-semibold text-text-heading">{task.title}</td>
                <td className="p-3.5 truncate max-w-xs text-text-secondary">{task.description || '--'}</td>
                <td className="p-3.5 capitalize">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                    task.status === 'doing' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                      'bg-zinc-500/10 text-text-secondary border-border-primary'
                    }`}>
                    {task.status === 'todo' ? 'To Do' : task.status}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-border-primary bg-bg-primary text-text-secondary">
                    {task.tag}
                  </span>
                </td>
                <td className="p-3.5">
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[9px] font-bold border border-bg-secondary shadow-sm">
                        {assignee.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-text-primary font-medium">{assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-text-secondary/60">Unassigned</span>
                  )}
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-text-secondary font-medium select-none">
                No tasks match your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


// ---------------------------------------------------------
// KANBAN COLUMN COMPONENT
// ---------------------------------------------------------
const Column: React.FC<ColumnProps> = ({ id, title, tasks, onEditTask, onAddTask }) => {
  // Setup dnd-kit droppable hook
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 flex flex-col min-w-[280px] bg-bg-secondary/20 border border-border-primary/50 rounded-2xl p-4 transition-all duration-200 ${isOver ? 'bg-purple-500/5 border-purple-500/30 shadow-lg' : ''
        }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 select-none">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-xs text-text-heading capitalize">{title}</h3>
          <span className="text-[10px] bg-bg-secondary text-text-secondary font-bold px-2 py-0.5 rounded-full border border-border-primary">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          aria-label={`Add task to ${title}`}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary p-1 rounded-lg transition-all cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="border border-dashed border-border-primary rounded-xl p-6 text-center select-none">
            <span className="text-[10px] text-text-secondary/70">Drop a task here</span>
          </div>
        )}
      </div>

      {/* Add Task Trigger */}
      <button
        onClick={() => onAddTask(id)}
        aria-label={`Add task to ${title}`}
        className="w-full flex items-center justify-center gap-1.5 mt-3 py-2 bg-transparent hover:bg-bg-secondary/40 border border-transparent hover:border-border-primary text-text-secondary hover:text-text-primary rounded-xl text-xs transition-all select-none cursor-pointer"
      >
        <Plus size={13} />
        <span>Add task</span>
      </button>
    </div>
  );
};

// ---------------------------------------------------------
// MAIN KANBAN BOARD VIEW
// ---------------------------------------------------------
export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask, onAddTask }) => {
  const { tasks, searchQuery, setSearchQuery, selectedTagFilter, setSelectedTagFilter, users } = useBoardStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useClickAway(filterRef, () => setShowFilterMenu(false), showFilterMenu);

  const hasActiveFilters = Boolean(searchQuery || selectedTagFilter);
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTagFilter(null);
  };

  // Filter tasks based on search query and tag selection
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTagFilter ? task.tag === selectedTagFilter : true;

    return matchesSearch && matchesTag;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const doingTasks = filteredTasks.filter((t) => t.status === 'doing');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  // List of all unique tags for filter menu
  const allTags = Array.from(new Set(tasks.map(t => t.tag)));

  return (
    <main className="flex-1 flex flex-col h-full bg-bg-primary overflow-hidden text-text-primary transition-colors duration-200">
      {/* Board Top Toolbar */}
      <header className="px-6 py-3 border-b border-border-primary/50 flex items-center justify-between select-none bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-heading text-base tracking-tight">
              Sprint Board
            </h1>
            <button aria-label="Star this board" className="text-text-secondary hover:text-amber-500 transition-colors cursor-pointer">
              <Star size={14} className="fill-transparent hover:fill-amber-500" />
            </button>
          </div>

          {/* Subtitle / Filter active tag */}
          <div className="flex items-center gap-1.5 border-l border-border-primary pl-4">
            {selectedTagFilter ? (
              <span className="text-[11px] bg-indigo-50/80 text-indigo-600 border border-indigo-200/50 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 animate-fade-in">
                <span>Filter: {selectedTagFilter}</span>
                <button
                  onClick={() => setSelectedTagFilter(null)}
                  aria-label={`Clear ${selectedTagFilter} filter`}
                  className="hover:text-text-primary cursor-pointer font-bold text-xs"
                >
                  &times;
                </button>
              </span>
            ) : (
              <span className="text-[11px] text-text-secondary font-medium">
                Active Sprint Board
              </span>
            )}
          </div>
        </div>

        {/* Header Right Actions: View Tabs + Actions */}
        <div className="flex items-center gap-4">
          
          {/* View switcher tabs styled like Google Calendar view controls */}
          <div className="flex items-center border border-border-primary rounded-lg overflow-hidden bg-bg-secondary shadow-sm">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border-r border-border-primary last:border-0 ${
                activeTab === 'kanban'
                  ? 'bg-bg-tertiary text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-text-secondary hover:bg-bg-tertiary/50'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border-r border-border-primary last:border-0 ${
                activeTab === 'table'
                  ? 'bg-bg-tertiary text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-text-secondary hover:bg-bg-tertiary/50'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border-r border-border-primary last:border-0 ${
                activeTab === 'calendar'
                  ? 'bg-bg-tertiary text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-text-secondary hover:bg-bg-tertiary/50'
              }`}
            >
              Calendar
            </button>
          </div>

          {/* User Avatars Group */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {users.slice(0, 4).map((user) => (
              <div
                key={user.id}
                title={user.name}
                className="w-5.5 h-5.5 rounded-full bg-bg-secondary border border-bg-primary flex items-center justify-center text-[9px] font-bold text-indigo-600 cursor-help shadow-sm"
              >
                {user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Filter Dropdown Toggle */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-haspopup="menu"
              aria-expanded={showFilterMenu}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                selectedTagFilter || showFilterMenu
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-bg-secondary border-border-primary hover:border-text-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filter</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl z-40 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block px-2 py-1 select-none font-sans">
                  Filter by Project Tag
                </span>
                <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      setSelectedTagFilter(null);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${!selectedTagFilter ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'hover:bg-bg-tertiary text-text-secondary'}`}
                  >
                    Clear Filter
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTagFilter(tag);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium truncate transition-colors cursor-pointer ${selectedTagFilter === tag ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'hover:bg-bg-tertiary text-text-secondary'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Board Columns Area */}
      <div className="flex-1 overflow-auto p-6 scrollbar-thin flex">
        {activeTab === 'kanban' ? (
          hasActiveFilters && filteredTasks.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-3 select-none">
              <FilterX size={28} className="text-text-secondary/60" />
              <p className="text-sm font-semibold text-text-heading">No tasks match your filters</p>
              <p className="text-xs text-text-secondary max-w-xs">
                {searchQuery && <>No results for “<span className="font-medium">{searchQuery}</span>”. </>}
                Try clearing the {selectedTagFilter ? 'tag filter' : 'search'} to see all tasks.
              </p>
              <button
                onClick={clearFilters}
                className="mt-1 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 px-4 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <FilterX size={13} />
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex-grow flex gap-6 overflow-x-auto h-full scrollbar-thin">
              <Column id="todo" title="To do" tasks={todoTasks} onEditTask={onEditTask} onAddTask={onAddTask} />
              <Column id="doing" title="Doing" tasks={doingTasks} onEditTask={onEditTask} onAddTask={onAddTask} />
              <Column id="done" title="Done" tasks={doneTasks} onEditTask={onEditTask} onAddTask={onAddTask} />
            </div>
          )
        ) : activeTab === 'table' ? (
          <TableView tasks={filteredTasks} onEditTask={onEditTask} />
        ) : (
          <CalendarView onEditTask={onEditTask} />
        )}
      </div>
    </main>
  );
};
