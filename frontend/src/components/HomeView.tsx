import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  FolderPlus, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  KanbanSquare, 
  FileText
} from 'lucide-react';
import { useBoardStore, type Task } from '../store/boardStore';
import { getToday, isOverdue, parseDateStr, todayStr } from '../utils/date';

interface HomeViewProps {
  onAddTask: (status: Task['status']) => void;
  onOpenBoard: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onAddTask, 
  onOpenBoard 
}) => {
  const { tasks, users } = useBoardStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<'project' | 'report'>('project');
  const [activeTimeout, setActiveTimeout] = useState<any>(null);

  const triggerToast = (message: string, icon: 'project' | 'report') => {
    if (activeTimeout) {
      clearTimeout(activeTimeout);
    }
    setToastMessage(message);
    setToastIcon(icon);
    
    const timeoutId = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    
    setActiveTimeout(timeoutId);
  };

  // Statistics calculation
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'doing').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  


  // Today's Tasks list (showing 4 active tasks that aren't finished yet or recently finished)
  const todaysTasks = tasks.slice(0, 4);

  // Helper to map project names to tags
  const projectsList = [
    { name: 'Sales Forecast', color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { name: 'Sentiment AI', color: 'bg-blue-500', barColor: 'bg-blue-500' },
    { name: 'Task Automate', color: 'bg-purple-500', barColor: 'bg-purple-500' },
    { name: 'Script AI', color: 'bg-amber-500', barColor: 'bg-amber-500' },
    { name: 'Lead Scoring', color: 'bg-rose-500', barColor: 'bg-rose-500' },
    { name: 'Heatmap AI', color: 'bg-teal-500', barColor: 'bg-teal-500' },
    { name: 'Social Boost', color: 'bg-violet-500', barColor: 'bg-violet-500' },
  ];

  // Build a friendly due-date label from the task's real date.
  const getDueLabel = (task: Task) => {
    if (task.status === 'done') return 'Completed';
    if (isOverdue(task.date, task.status)) return '⚠️ Overdue';
    if (!task.date) return 'No due date';
    if (task.date === todayStr()) return 'Due Today';
    const diffDays = Math.round(
      (parseDateStr(task.date).getTime() - getToday().getTime()) / 86_400_000
    );
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due ${parseDateStr(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleCreateProject = () => {
    triggerToast("Project creation is simulated. Drag cards in Kanban to manage!", "project");
  };

  return (
    <div className="flex-grow flex flex-col h-screen overflow-y-auto bg-bg-primary p-6 md:p-8 select-none">
      
      {/* Glassmorphic Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-6 right-6 z-50 bg-bg-secondary/85 backdrop-blur-md border border-purple-500/30 dark:border-purple-500/20 text-text-primary px-4.5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ring-1 ring-purple-500/10 select-none max-w-sm">
          {toastIcon === 'project' ? (
            <FolderPlus size={15} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
          ) : (
            <FileText size={15} className="text-emerald-500 flex-shrink-0 animate-pulse" />
          )}
          <span className="text-xs font-semibold text-text-heading leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Welcoming Section */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-heading tracking-tight flex items-center gap-2">
            Welcome back, Astra Admin! <span className="animate-bounce">✨</span>
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Here's what's happening with your workspace and sprint plans today.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onAddTask('todo')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Task</span>
          </button>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-primary rounded-xl text-xs font-semibold transition-all transform active:scale-95 cursor-pointer"
          >
            <FolderPlus size={14} className="text-text-secondary" />
            <span>Create Project</span>
          </button>
          <button
            onClick={onOpenBoard}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-primary rounded-xl text-xs font-semibold transition-all transform active:scale-95 cursor-pointer"
          >
            <KanbanSquare size={14} className="text-text-secondary" />
            <span>Open Board</span>
          </button>
        </div>
      </header>

      {/* 1. Stats Grid Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Total Tasks */}
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Total Tasks</span>
            <span className="text-3xl font-bold text-text-heading">{totalTasks}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">In Progress</span>
            <span className="text-3xl font-bold text-text-heading">{inProgressTasks}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Completed</span>
            <span className="text-3xl font-bold text-text-heading">{completedTasks}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </section>



      {/* Main Grid Content Sections */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Hand: Today's Tasks & Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. Today's Tasks List */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-heading flex items-center gap-2">
                <Calendar size={14} className="text-purple-500" />
                <span>Today's Overview Tasks</span>
              </h2>
              <button 
                onClick={onOpenBoard}
                className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Board</span>
                <ArrowRight size={10} />
              </button>
            </div>

            <div className="divide-y divide-border-primary/40">
              {todaysTasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const isTaskOverdue = isOverdue(task.date, task.status);

                return (
                  <div key={task.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-bg-tertiary/10 rounded-lg px-2 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox Icon */}
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${
                        task.status === 'done'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-border-primary bg-bg-primary'
                      }`}>
                        {task.status === 'done' && <CheckCircle2 size={10} className="stroke-[3]" />}
                      </span>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-semibold text-text-heading truncate max-w-xs md:max-w-md">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[8px] font-bold px-1.5 py-0.2 bg-bg-primary text-text-secondary border border-border-primary rounded">
                            {task.tag}
                          </span>
                          <span className={`text-[8px] font-semibold ${isTaskOverdue ? 'text-red-500' : 'text-text-secondary'}`}>
                            {getDueLabel(task)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Assignee Avatar Initials */}
                    <div className="flex-shrink-0">
                      {assignee ? (
                        <div 
                          title={assignee.name}
                          className="w-5.5 h-5.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-border-primary flex items-center justify-center text-[9px] font-bold shadow-inner"
                        >
                          {getInitials(assignee.name)}
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-secondary/40">--</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {todaysTasks.length === 0 && (
                <div className="text-center py-6 text-[11px] text-text-secondary/60">
                  No active tasks found in database. Create a task above!
                </div>
              )}
            </div>
          </div>

          {/* 4. Recent Projects (Progress bars) */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-heading flex items-center gap-2">
              <FolderPlus size={14} className="text-purple-500" />
              <span>Active Projects & Progress</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsList.map(proj => {
                const projectTasks = tasks.filter(t => t.tag === proj.name);
                const projectCompleted = projectTasks.filter(t => t.status === 'done').length;
                const totalProjTasks = projectTasks.length;
                
                // Calculate percentage
                const completionPercentage = totalProjTasks > 0 
                  ? Math.round((projectCompleted / totalProjTasks) * 100) 
                  : 0;

                return (
                  <div key={proj.name} className="p-3 border border-border-primary/60 rounded-xl space-y-2.5 bg-bg-primary/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${proj.color} flex-shrink-0`} />
                        <span className="text-xs font-semibold text-text-heading truncate">{proj.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary">
                        {completionPercentage}%
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${proj.barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-text-secondary block font-medium">
                        {projectCompleted} of {totalProjTasks} tasks finished
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Hand: AI Insights Panel, Activity Feed & Quick Actions */}
        <div className="space-y-6">
          
          {/* 3. AI Insights Panel */}
          <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 dark:border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
            {/* Spotlight decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-heading">TrackFlow AI Insights</h3>
            </div>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
                <span className="text-yellow-500 flex-shrink-0 mt-0.5">⚠️</span>
                <span>
                  <strong>Sales Forecast</strong> tasks are stalling in review. Consider reassigning to <strong>Robert Licau</strong> to clear the bottleneck.
                </span>
              </div>
              {/* Insight 2 */}
              <div className="flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5">💡</span>
                <span>
                  Sprint completion rate is up by <strong>14%</strong> this week. High velocity detected!
                </span>
              </div>
              {/* Insight 3 */}
              <div className="flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
                <span className="text-purple-500 flex-shrink-0 mt-0.5">⚡</span>
                <span>
                  <strong>Script AI</strong> project workload is currently unassigned. Assigning <strong>John Doe</strong> will balance sprint load.
                </span>
              </div>
            </div>
          </div>

          {/* 5. Activity Feed */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-heading flex items-center gap-2">
              <FileText size={14} className="text-purple-500" />
              <span>Activity Feed</span>
            </h2>

            <div className="space-y-3.5">
              {/* Event 1 */}
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  RL
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <span className="font-semibold text-text-heading">Robert Licau</span> moved <span className="font-medium text-text-heading">Generate AI Blog Draft</span> to <span className="text-blue-500 font-semibold">Doing</span>
                  </p>
                  <span className="text-[9px] text-text-secondary/60 block">10 minutes ago</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  TK
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <span className="font-semibold text-text-heading">Teja Karan</span> created task <span className="font-medium text-text-heading">Automate Social Media Posts</span> in <span className="font-semibold">Social Boost</span>
                  </p>
                  <span className="text-[9px] text-text-secondary/60 block">2 hours ago</span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  AA
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <span className="font-semibold text-text-heading">Astra Admin</span> completed task <span className="font-medium text-text-heading">Optimize AI Model Performance</span>
                  </p>
                  <span className="text-[9px] text-text-secondary/60 block">4 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Quick Actions Section */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-heading flex items-center gap-2">
              <Sparkles size={14} className="text-purple-500" />
              <span>Quick Actions</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={onOpenBoard}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border-primary bg-bg-primary/45 hover:bg-bg-tertiary transition-colors text-center gap-1.5 cursor-pointer"
              >
                <KanbanSquare size={15} className="text-purple-500" />
                <span className="text-[9px] font-bold text-text-heading">Open Kanban</span>
              </button>

              <button 
                onClick={() => triggerToast("Report generation is simulated. Sprint velocity is standing at 85%!", "report")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border-primary bg-bg-primary/45 hover:bg-bg-tertiary transition-colors text-center gap-1.5 cursor-pointer"
              >
                <FileText size={15} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-text-heading">View Reports</span>
              </button>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
