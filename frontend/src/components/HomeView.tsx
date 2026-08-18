import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Bookmark
} from 'lucide-react';
import { useBoardStore, type Task } from '../store/boardStore';
import { useWorkspaceStore } from '../store/workspaceStore';

interface HomeViewProps {
  onAddTask: (status: Task['status']) => void;
  onOpenBoard: () => void;
}

interface TabItem {
  id: 'recommended' | 'assigned' | 'agents' | 'starred' | 'worked' | 'viewed';
  label: string;
  badge?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onAddTask, 
  onOpenBoard 
}) => {
  const { tasks, users } = useBoardStore();
  const { workspaces } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<'recommended' | 'assigned' | 'agents' | 'starred' | 'worked' | 'viewed'>('worked');

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format date display
  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return 'August 7';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'August 7';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  // Recommended spaces from API
  const recommendedSpaces = workspaces.map((w, idx) => {
    const gradients = [
      'from-indigo-600 to-purple-600',
      'from-cyan-500 to-blue-600',
      'from-amber-500 to-yellow-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600'
    ];
    return {
      id: w.id,
      name: w.name,
      type: 'Software space',
      color: gradients[idx % gradients.length],
      letter: w.name.charAt(0).toUpperCase(),
      key: w.workspaceKey
    };
  });

  // Tabs navigation list
  const tabs: TabItem[] = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'assigned', label: 'Assigned to me', badge: '99+' },
    { id: 'agents', label: 'My agent sessions' },
    { id: 'starred', label: 'Starred' },
    { id: 'worked', label: 'Worked on' },
    { id: 'viewed', label: 'Viewed' }
  ];

  return (
    <div className="flex-grow flex flex-col h-screen overflow-y-auto bg-bg-primary text-text-primary p-6 md:p-8 select-none transition-colors duration-200">
      
      {/* 1. Recommended Spaces section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text-heading tracking-wide">Recommended spaces</h2>
          <button className="text-xs text-text-secondary hover:text-text-primary font-semibold transition-colors cursor-pointer">
            View all spaces
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedSpaces.map(space => (
            <div 
              key={space.name} 
              onClick={onOpenBoard}
              className="flex items-center gap-3.5 p-4 bg-bg-secondary border border-border-primary/80 hover:border-border-primary rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              {/* Space logo avatar box */}
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${space.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                {space.letter}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-text-heading truncate">{space.name}</h3>
                <span className="text-[10px] text-text-secondary block mt-0.5">{space.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. For You tabs & list */}
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Section title header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-bold text-text-heading tracking-wide flex items-center gap-2">
            <span>For you</span>
          </h2>

          {/* Jira-style Filter Tabs Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/40'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[9px] px-1 py-0.2 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. List of Active Tasks */}
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-5 shadow-sm flex-1 overflow-y-auto space-y-4">
          
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pb-1 border-b border-border-primary/45">
            In the last month
          </div>

          <div className="divide-y divide-border-primary/40 space-y-1">
            {tasks.map((task, idx) => {
              const assignee = users.find(u => u.id === task.assigneeId);
              const spaceName = workspaces.find(w => w.workspaceKey === task.tag)?.name || task.tag || 'Software space';
              const taskKey = `TRACK-${1000 + idx}`;

              return (
                <div 
                  key={task.id} 
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-bg-tertiary/10 rounded-xl px-3.5 transition-colors cursor-pointer"
                  onClick={onOpenBoard}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Status check symbol */}
                    <span className={`flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center ${
                      task.status === 'done'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border-primary bg-bg-primary text-text-secondary/70'
                    }`}>
                      {task.status === 'done' ? (
                        <CheckCircle2 size={11} className="stroke-[3]" />
                      ) : (
                        <Bookmark size={11} className={idx % 3 === 0 ? 'text-amber-500 fill-amber-500/10' : ''} />
                      )}
                    </span>

                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-text-heading hover:text-purple-500 transition-colors truncate max-w-xs md:max-w-2xl">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary">
                        <span className="capitalize">{task.status === 'done' ? 'Story' : 'Task'}</span>
                        <span>•</span>
                        <span className="font-semibold text-text-primary/95">{taskKey}</span>
                        <span>•</span>
                        <span>{spaceName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignee initials avatar & Date */}
                  <div className="flex items-center gap-3.5 flex-shrink-0">
                    {assignee ? (
                      <div 
                        title={assignee.name}
                        className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                      >
                        {getInitials(assignee.name)}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neutral-500/20 text-text-secondary flex items-center justify-center text-[9px] font-semibold">
                        TD
                      </div>
                    )}

                    <span className="text-[10px] text-text-secondary w-20 text-right">
                      {formatDateLabel(task.date)}
                    </span>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs text-text-secondary">No recent active tasks found in this workspace.</p>
                <button 
                  onClick={() => onAddTask('todo')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Create Your First Task
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
