import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  CheckSquare, Clock, AlertTriangle, TrendingUp, Users,
  BarChart2, Target, Calendar, ChevronLeft, ChevronRight,
  Flame, Sparkles
} from 'lucide-react';
import { useBoardStore, type Task, type User } from '../store/boardStore';
import { addDays, getToday, isOverdue, parseDateStr, toDateStr } from '../utils/date';

// ─── Real-data derivations ───────────────────────────────────────────────────
// Everything below is computed from the live store (tasks + users) so the
// dashboard always matches the board instead of showing fixed mock numbers.

const TEAM_PALETTE = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'];

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const countBy = (tasks: Task[], status: Task['status']) =>
  tasks.filter((t) => t.status === status).length;

const buildDistribution = (tasks: Task[]) => [
  { name: 'To Do', value: countBy(tasks, 'todo'), color: '#6366f1' },
  { name: 'In Progress', value: countBy(tasks, 'doing'), color: '#f59e0b' },
  { name: 'Done', value: countBy(tasks, 'done'), color: '#10b981' },
];

const buildTeam = (tasks: Task[], users: User[]) =>
  users.map((u, i) => {
    const userTasks = tasks.filter((t) => t.assigneeId === u.id);
    return {
      name: u.name,
      initials: initials(u.name),
      completed: userTasks.filter((t) => t.status === 'done').length,
      total: userTasks.length,
      color: TEAM_PALETTE[i % TEAM_PALETTE.length],
    };
  });

const buildWorkload = (tasks: Task[], users: User[]) =>
  users.map((u) => {
    const ut = tasks.filter((t) => t.assigneeId === u.id);
    return {
      name: u.name.split(' ')[0],
      todo: countBy(ut, 'todo'),
      doing: countBy(ut, 'doing'),
      done: countBy(ut, 'done'),
    };
  });

// 7-day completion trend built from each task's real due date.
const buildTrend = (tasks: Task[]) =>
  Array.from({ length: 7 }, (_, idx) => {
    const d = addDays(getToday(), idx - 6);
    const ds = toDateStr(d);
    const dayTasks = tasks.filter((t) => t.date === ds);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      completed: dayTasks.filter((t) => t.status === 'done').length,
      added: dayTasks.length,
    };
  });

const buildOverdue = (tasks: Task[], users: User[]) =>
  tasks
    .filter((t) => isOverdue(t.date, t.status))
    .map((t) => {
      const assignee = users.find((u) => u.id === t.assigneeId);
      const daysLate = Math.max(
        1,
        Math.round((getToday().getTime() - parseDateStr(t.date!).getTime()) / 86_400_000)
      );
      return {
        id: t.id,
        title: t.title,
        project: t.tag,
        daysLate,
        assignee: assignee ? initials(assignee.name) : '--',
      };
    })
    .sort((a, b) => b.daysLate - a.daysLate);

const TOTAL_DAYS = 14;
const STATUS_PROGRESS: Record<Task['status'], number> = { todo: 10, doing: 50, done: 100 };

// Gantt rows derived from real tasks, laid out on a 14-day window centred on today.
const buildGantt = (tasks: Task[]) => {
  const sprintStart = addDays(getToday(), -7);
  const todayIndex = 7;
  const items = tasks
    .filter((t) => t.date)
    .map((t) => {
      const offset = Math.round(
        (parseDateStr(t.date!).getTime() - sprintStart.getTime()) / 86_400_000
      );
      const start = Math.max(0, Math.min(offset, TOTAL_DAYS - 1));
      const duration = Math.min(3, TOTAL_DAYS - start);
      return {
        id: t.id,
        title: t.title,
        project: t.tag,
        status: t.status,
        start,
        duration,
        progress: STATUS_PROGRESS[t.status],
      };
    });
  return { items, sprintStart, todayIndex };
};
const STATUS_COLORS: Record<string, string> = {
  todo: '#6366f1',
  doing: '#f59e0b',
  done: '#10b981',
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Summary stat card */
const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  'text-purple-400': {
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-100 dark:border-purple-900/30',
    glow: 'hover:shadow-purple-500/5'
  },
  'text-emerald-400': {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    glow: 'hover:shadow-emerald-500/5'
  },
  'text-blue-400': {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-100 dark:border-blue-900/30',
    glow: 'hover:shadow-blue-500/5'
  },
  'text-red-400': {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-100 dark:border-red-900/30',
    glow: 'hover:shadow-red-500/5'
  },
  'text-amber-400': {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/30',
    glow: 'hover:shadow-amber-500/5'
  }
};

function StatCard({ label, value, icon: Icon, color, subtext }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; subtext?: string;
}) {
  const styles = colorMap[color] || {
    text: color,
    bg: 'bg-zinc-50 dark:bg-zinc-900/30',
    border: 'border-zinc-100 dark:border-zinc-800/30',
    glow: ''
  };

  return (
    <div className={`bg-bg-secondary border border-border-primary rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-transparent dark:hover:bg-bg-tertiary/20 transition-all duration-300 group hover:-translate-y-0.5 ${styles.glow}`}>
      <div className="flex flex-col space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">{label}</span>
        <span className={`text-3xl font-extrabold tracking-tight ${styles.text} block leading-none`}>
          {value}
        </span>
        {subtext && (
          <span className="text-[11px] font-medium text-text-secondary block mt-1">
            {subtext}
          </span>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${styles.bg} ${styles.border}`}>
        <Icon size={22} className={styles.text} />
      </div>
    </div>
  );
}

/** Section title with icon */
function SectionTitle({ icon: Icon, title, color = 'text-purple-400' }: {
  icon: React.ElementType; title: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-7 h-7 rounded-lg bg-purple-600/15 border border-purple-500/25 flex items-center justify-center ${color}`}>
        <Icon size={13} />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-text-heading">{title}</h2>
    </div>
  );
}

/** Custom recharts tooltip */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-3 shadow-xl text-xs min-w-[120px]">
      {label && <p className="text-text-secondary mb-1.5 font-semibold">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary capitalize">{p.name}:</span>
          <span className="font-bold text-text-heading">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Custom donut label */
function DonutLabel({ cx, cy, total }: { cx: number; cy: number; value?: number; total: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="currentColor" className="text-text-heading">
      <tspan x={cx} dy="-6" fontSize="22" fontWeight="bold" fill="var(--text-heading)">{total}</tspan>
      <tspan x={cx} dy="20" fontSize="10" fill="var(--text-secondary)">Tasks</tspan>
    </text>
  );
}

// ─── Gantt Chart ─────────────────────────────────────────────────────────────

type GanttItem = ReturnType<typeof buildGantt>['items'][number];

function GanttChart() {
  const { tasks } = useBoardStore();
  const { items: ganttTasks, sprintStart, todayIndex } = buildGantt(tasks);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [tooltip, setTooltip] = useState<{ task: GanttItem; x: number; y: number } | null>(null);
  const visibleDays = 10;
  const dayWidth = 52;

  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(sprintStart, i));

  const visibleDaySlice = days.slice(scrollOffset, scrollOffset + visibleDays);
  const canScrollLeft = scrollOffset > 0;
  const canScrollRight = scrollOffset + visibleDays < TOTAL_DAYS;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle icon={Calendar} title="Timeline / Gantt Chart" />
        <div className="flex gap-1">
          <button
            onClick={() => setScrollOffset(Math.max(0, scrollOffset - 1))}
            disabled={!canScrollLeft}
            aria-label="Scroll timeline earlier"
            className="w-7 h-7 rounded-lg border border-border-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setScrollOffset(Math.min(TOTAL_DAYS - visibleDays, scrollOffset + 1))}
            disabled={!canScrollRight}
            aria-label="Scroll timeline later"
            className="w-7 h-7 rounded-lg border border-border-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-3">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 text-[10px] text-text-secondary capitalize">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
            {s}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary ml-auto">
          <span className="w-px h-4 bg-red-400/70 inline-block" />
          Today
        </div>
      </div>

      <div className="overflow-hidden relative">
        {/* Header row — day labels */}
        <div className="flex" style={{ marginLeft: 168 }}>
          {visibleDaySlice.map((d, i) => {
            const absIndex = scrollOffset + i;
            const isToday = absIndex === todayIndex;
            return (
              <div
                key={i}
                className={`flex-shrink-0 text-center text-[9px] font-bold pb-2 border-b border-border-primary transition-colors ${isToday ? 'text-red-400' : 'text-text-secondary'}`}
                style={{ width: dayWidth }}
              >
                {d.toLocaleDateString('en', { weekday: 'short' })}
                <br />
                <span className={`text-[10px] font-bold ${isToday ? 'text-red-400' : 'text-text-heading'}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Task rows */}
        <div className="space-y-1.5 mt-2 relative">
          {ganttTasks.map((task) => {
            const barStart = Math.max(task.start - scrollOffset, 0);
            const barEnd = Math.min(task.start + task.duration - scrollOffset, visibleDays);
            const isVisible = barEnd > 0 && barStart < visibleDays;
            const clippedLeft = Math.max(task.start - scrollOffset, 0);
            const clippedWidth = Math.min(task.start + task.duration - scrollOffset, visibleDays) - clippedLeft;
            const color = STATUS_COLORS[task.status];

            return (
              <div key={task.id} className="flex items-center gap-0" style={{ height: 32 }}>
                {/* Task label */}
                <div className="flex-shrink-0 flex items-center gap-1.5 pr-3" style={{ width: 168 }}>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[10px] text-text-primary truncate leading-tight font-medium">{task.title}</span>
                </div>

                {/* Bar area */}
                <div className="relative flex-shrink-0" style={{ width: dayWidth * visibleDays, height: 28 }}>
                  {/* Today line */}
                  {todayIndex >= scrollOffset && todayIndex < scrollOffset + visibleDays && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400/50 z-10"
                      style={{ left: (todayIndex - scrollOffset) * dayWidth }}
                    />
                  )}

                  {isVisible && clippedWidth > 0 && (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${task.title}, ${task.project}, ${task.status}, ${task.progress}% complete`}
                      className="absolute top-1 rounded-md cursor-pointer transition-opacity hover:opacity-80 flex items-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                      style={{
                        left: clippedLeft * dayWidth + 2,
                        width: clippedWidth * dayWidth - 4,
                        height: 22,
                        background: `${color}22`,
                        border: `1px solid ${color}55`,
                      }}
                      onMouseEnter={(e) => setTooltip({ task, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setTooltip({ task, x: r.left, y: r.top });
                      }}
                      onBlur={() => setTooltip(null)}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute top-0 left-0 bottom-0 rounded-md"
                        style={{ width: `${task.progress}%`, background: `${color}50` }}
                      />
                      <span className="relative text-[9px] font-bold px-1.5 truncate" style={{ color }}>
                        {task.progress > 0 ? `${task.progress}%` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-bg-secondary border border-border-primary rounded-xl p-3 shadow-2xl text-xs pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
        >
          <p className="font-bold text-text-heading mb-1">{tooltip.task.title}</p>
          <p className="text-text-secondary">{tooltip.task.project}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[tooltip.task.status] }} />
            <span className="capitalize text-text-secondary">{tooltip.task.status}</span>
            <span className="ml-2 font-semibold text-text-heading">{tooltip.task.progress}% done</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DataInsightsViewProps {
  showAIPanel: boolean;
  onToggleAIPanel: () => void;
}

export const DataInsightsView: React.FC<DataInsightsViewProps> = ({ showAIPanel, onToggleAIPanel }) => {
  const { tasks, users } = useBoardStore();

  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'doing').length;

  // Derived datasets — all from the live store.
  const distributionData = buildDistribution(tasks);
  const teamData = buildTeam(tasks, users);
  const workloadData = buildWorkload(tasks, users);
  const completionTrend = buildTrend(tasks);
  const overdueTasks = buildOverdue(tasks, users);

  const overdue = overdueTasks.length;
  // Guard against divide-by-zero on an empty board.
  const productivity = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  const totalDistribution = totalTasks;

  // Days remaining = days until the latest upcoming due date among unfinished tasks.
  const upcomingDates = tasks
    .filter((t) => t.status !== 'done' && t.date)
    .map((t) => parseDateStr(t.date!).getTime());
  const daysLeft = upcomingDates.length
    ? Math.max(0, Math.round((Math.max(...upcomingDates) - getToday().getTime()) / 86_400_000))
    : 0;
  const sprintData = {
    name: 'Current Sprint',
    progress: productivity,
    daysLeft,
    totalDays: TOTAL_DAYS,
    tasksCompleted: completed,
    totalTasks,
  };

  // Text alternatives so screen readers get the gist of each chart.
  const trendSummary = `Task completion trend over the last 7 days. ${completionTrend
    .map((d) => `${d.day}: ${d.completed} completed of ${d.added} due`)
    .join('; ')}.`;
  const distributionSummary = `Task distribution across ${totalTasks} tasks — ${distributionData
    .map((d) => `${d.value} ${d.name}`)
    .join(', ')}.`;
  const workloadSummary = `Workload by team member — ${workloadData
    .map((w) => `${w.name}: ${w.todo + w.doing + w.done} tasks (${w.done} done)`)
    .join('; ')}.`;

  return (
    <div className="flex-grow flex flex-col h-full overflow-y-auto bg-bg-primary">
      <div className="p-6 space-y-6 pb-6">

        {/* ── Page Header ─────────────────────────────────── */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-heading flex items-center gap-2">
              <BarChart2 size={22} className="text-purple-400" />
              Data Insights
            </h1>
            <p className="text-xs text-text-secondary mt-1">Sprint analytics, team performance & timeline overview</p>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Panel Toggle Button */}
            <button
              onClick={onToggleAIPanel}
              aria-pressed={showAIPanel}
              aria-label="Toggle TrackFlow AI assistant"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                showAIPanel
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                  : 'bg-bg-secondary border-border-primary hover:border-text-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sparkles size={12} className={showAIPanel ? 'text-indigo-600 dark:text-indigo-300 animate-pulse' : 'text-text-secondary'} />
              <span>TrackFlow AI</span>
            </button>

            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1.5">
              <Flame size={11} />
              Sprint 4 Live
            </div>
          </div>
        </header>

        {/* ── 1. Summary Cards ────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Tasks" value={totalTasks} icon={CheckSquare} color="text-purple-400" subtext={`${tasks.length} tracked`} />
          <StatCard label="Completed" value={completed} icon={Target} color="text-emerald-400" subtext="This sprint" />
          <StatCard label="In Progress" value={inProgress} icon={Clock} color="text-blue-400" subtext="Active now" />
          <StatCard label="Overdue" value={overdue} icon={AlertTriangle} color="text-red-400" subtext="Need attention" />
          <StatCard label="Productivity" value={`${productivity}%`} icon={TrendingUp} color="text-amber-400" subtext="Completion rate" />
        </section>

        {/* ── 2. Charts Row ───────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Line/Bar chart — Task Completion Trend */}
          <div className="lg:col-span-2 bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm">
            <SectionTitle icon={TrendingUp} title="Task Completion Trend (7 Days)" />
            <div role="img" aria-label={trendSummary}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={completionTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 5 }} name="Completed" />
                <Line type="monotone" dataKey="added" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} strokeDasharray="4 2" activeDot={{ r: 5 }} name="Added" />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart — Task Distribution */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm flex flex-col">
            <SectionTitle icon={BarChart2} title="Task Distribution" />
            <div className="flex-grow flex items-center justify-center" role="img" aria-label={distributionSummary}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ cx, cy }) => <DonutLabel cx={cx} cy={cy} value={0} total={totalDistribution} />}
                    labelLine={false}
                  >
                    {distributionData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 mt-auto">
              {distributionData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-text-secondary">{d.name}</span>
                  </div>
                  <span className="font-bold text-text-heading">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 & 4. Team Performance + Workload ─────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Team Performance */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm">
            <SectionTitle icon={Users} title="Team Performance" />
            <div className="space-y-4">
              {teamData.map((m) => {
                const pct = Math.round((m.completed / m.total) * 100);
                return (
                  <div key={m.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: m.color }}
                        >
                          {m.initials}
                        </div>
                        <span className="text-text-primary font-medium">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-secondary">{m.completed}/{m.total}</span>
                        <span className="font-bold" style={{ color: m.color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: m.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workload Distribution Bar Chart */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm">
            <SectionTitle icon={BarChart2} title="Workload Distribution" />
            <div role="img" aria-label={workloadSummary}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={workloadData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Bar dataKey="todo" fill="#6366f1" radius={[3, 3, 0, 0]} name="To Do" />
                <Bar dataKey="doing" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Doing" />
                <Bar dataKey="done" fill="#10b981" radius={[3, 3, 0, 0]} name="Done" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── 5 & 6. Overdue Tasks + Sprint Progress ──────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Overdue Tasks */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm">
            <SectionTitle icon={AlertTriangle} title="Overdue Tasks" color="text-red-400" />
            <div className="space-y-2.5">
              {overdueTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15 hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-full min-h-[32px] rounded-full bg-red-400/70 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-text-heading">{t.title}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{t.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-full px-2 py-0.5">
                      +{t.daysLate}d late
                    </span>
                    <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-[9px] font-bold text-text-secondary">
                      {t.assignee}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Progress */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <SectionTitle icon={Target} title="Sprint Progress" color="text-emerald-400" />
            <div className="space-y-4">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-xs text-text-secondary">{sprintData.name}</p>
                    <p className="text-3xl font-bold text-text-heading mt-1">{sprintData.progress}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-secondary">Days Remaining</p>
                    <p className="text-xl font-bold text-amber-400">{sprintData.daysLeft}</p>
                  </div>
                </div>
                <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-1000 relative"
                    style={{ width: `${sprintData.progress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between mt-1.5 text-[9px] text-text-secondary">
                  <span>Day 1</span>
                  <span>Day {sprintData.totalDays}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-tertiary rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{sprintData.tasksCompleted}</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Tasks Done</p>
                </div>
                <div className="bg-bg-tertiary rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-purple-400">{sprintData.totalTasks - sprintData.tasksCompleted}</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Remaining</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Gantt Timeline ───────────────────────────── */}
        <GanttChart />

      </div>
    </div>
  );
}
