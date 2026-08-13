import React, { useState } from 'react';
import {
  Home,
  PenTool,
  BarChart3,
  CheckSquare,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import { buildMonthGrid, formatMonthYear, getToday } from '../utils/date';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAddTask: () => void;
  collapsed?: boolean;
}

// Stable color palette so each derived project tag keeps a consistent dot color.
const PROJECT_PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#14b8a6', '#a78bfa', '#ec4899', '#0ea5e9', '#84cc16'];
const colorForTag = (tag: string) => {
  const sum = tag.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PROJECT_PALETTE[sum % PROJECT_PALETTE.length];
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onAddTask, collapsed = false }) => {
  const {
    selectedTagFilter,
    setSelectedTagFilter,
    tasks,
  } = useBoardStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks Board', icon: CheckSquare },
    { id: 'ai-writer', label: 'AI Writer', icon: PenTool },
    { id: 'data-insights', label: 'Data Insights', icon: BarChart3 },
  ];

  // Projects are derived from the tags actually present on tasks, so the list
  // always reflects real data instead of a hardcoded set.
  const projects = Array.from(new Set(tasks.map((t) => t.tag)))
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({ name: tag, color: colorForTag(tag), tag }));

  // Helper to calculate total count for each project/tag
  const getTaskCountByTag = (tag: string) => {
    return tasks.filter(t => t.tag === tag).length;
  };

  // Mini calendar driven by the real current month (Sunday-aligned to match the S–S header).
  const [miniViewDate, setMiniViewDate] = useState(getToday());
  const miniDays = buildMonthGrid(miniViewDate, 0);
  const goPrevMonth = () =>
    setMiniViewDate(new Date(miniViewDate.getFullYear(), miniViewDate.getMonth() - 1, 1));
  const goNextMonth = () =>
    setMiniViewDate(new Date(miniViewDate.getFullYear(), miniViewDate.getMonth() + 1, 1));

  return (
    <aside
      aria-hidden={collapsed}
      className={`flex-shrink-0 bg-bg-secondary border-r border-border-primary flex flex-col h-full select-none overflow-hidden transition-[width,opacity] duration-200 ${
        collapsed ? 'w-0 opacity-0 border-r-0 pointer-events-none' : 'w-64 opacity-100'
      }`}
    >
      {/* Google Calendar "+ Create" Button */}
      <div className="pt-4 px-4 pb-2">
        <button
          onClick={onAddTask}
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#303134] hover:bg-bg-tertiary text-text-primary dark:text-white rounded-full text-sm font-medium shadow-card border border-border-primary/50 transition-all hover:shadow-lg active:scale-95 cursor-pointer group"
        >
          {/* Multi-colored Google-style Plus Icon */}
          <span className="relative flex items-center justify-center w-6 h-6">
            <span className="absolute w-5 h-1 bg-[#1a73e8] rounded-full group-hover:scale-110 transition-transform"></span>
            <span className="absolute w-1 h-5 bg-[#34a853] rounded-full group-hover:scale-110 transition-transform"></span>
            <span className="absolute w-3 h-1 bg-[#f9ab00] rounded-full group-hover:scale-110 transition-transform"></span>
            <span className="absolute w-1 h-3 bg-[#ea4335] rounded-full group-hover:scale-110 transition-transform"></span>
          </span>
          <span className="font-semibold text-[#3c4043] dark:text-white tracking-wide">Create</span>
        </button>
      </div>

      {/* Scrollable Sidebar Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* MINI CALENDAR SECTION */}
        <div className="px-1 py-2 border-b border-border-primary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#3c4043] dark:text-white">{formatMonthYear(miniViewDate)}</span>
            <div className="flex gap-1.5">
              <button onClick={goPrevMonth} className="p-1 hover:bg-bg-tertiary rounded-full text-text-secondary cursor-pointer" aria-label="Previous month">
                <ChevronLeft size={13} />
              </button>
              <button onClick={goNextMonth} className="p-1 hover:bg-bg-tertiary rounded-full text-text-secondary cursor-pointer" aria-label="Next month">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-text-secondary mb-1">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          {/* Days Grid */}
          <div className="grid grid-cols-7 text-center gap-y-1 text-[10px] font-medium text-text-primary">
            {miniDays.map((d) => (
              <div
                key={d.dateStr}
                className={`h-5 flex items-center justify-center rounded-full cursor-pointer hover:bg-bg-tertiary ${
                  d.isCurrentMonth ? 'text-text-primary font-semibold' : 'text-text-secondary/40'
                } ${d.isToday ? 'bg-[#1a73e8] text-white hover:bg-[#1a73e8]/90 font-bold' : ''}`}
              >
                {d.day}
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGATION VIEWS */}
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedTagFilter(null);
                  setActiveSection(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-left text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
                    : 'hover:bg-bg-tertiary text-[#3c4043] dark:text-[#c4c7c5] hover:text-text-heading'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-purple-600 dark:text-purple-300' : 'text-text-secondary'} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* MY PROJECTS (Google Calendar "My Calendars" Style Checklist) */}
        <div>
          <span className="px-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">
            My Projects
          </span>
          <div className="space-y-1">
            {projects.map((proj) => {
              const isSelected = proj.tag ? selectedTagFilter === proj.tag : (!selectedTagFilter && activeSection === 'tasks');
              return (
                <button
                  key={proj.name}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Filter by ${proj.name}`}
                  onClick={() => {
                    if (proj.tag) {
                      setSelectedTagFilter(proj.tag);
                      setActiveSection('tasks');
                    } else {
                      setSelectedTagFilter(null);
                      setActiveSection('tasks');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1 rounded-lg text-left text-xs font-medium hover:bg-bg-tertiary/60 transition-all cursor-pointer group`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Google Calendar Checkbox */}
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: isSelected ? proj.color : 'transparent',
                        borderColor: proj.color
                      }}
                      className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white stroke-current stroke-[3]" fill="none" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className={`truncate text-xs ${isSelected ? 'font-bold text-text-heading' : 'text-text-primary'}`}>
                      {proj.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    {proj.tag ? getTaskCountByTag(proj.tag) : tasks.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
