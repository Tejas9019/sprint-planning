import {
  Home,
  PenTool,
  BarChart3,
  CheckSquare,
  GitFork,
  PanelLeftClose
} from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAddTask: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const WORKSPACE_COLORS = ['#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#f43f5e'];
const colorForWorkspace = (key: string) => {
  const sum = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return WORKSPACE_COLORS[sum % WORKSPACE_COLORS.length];
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onAddTask, collapsed = false, onToggleCollapse }) => {
  const {
    selectedTagFilter,
    setSelectedTagFilter,
    tasks,
  } = useBoardStore();

  const { workspaces } = useWorkspaceStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks Board', icon: CheckSquare },
    { id: 'workflows', label: 'Workflows', icon: GitFork },
    { id: 'ai-writer', label: 'AI Writer', icon: PenTool },
    { id: 'data-insights', label: 'Data Insights', icon: BarChart3 },
  ];

  return (
    <aside
      aria-hidden={collapsed}
      className={`flex-shrink-0 bg-bg-secondary border-r border-border-primary flex flex-col h-full select-none overflow-hidden transition-[width,opacity] duration-200 ${
        collapsed ? 'w-0 opacity-0 border-r-0 pointer-events-none' : 'w-64 opacity-100'
      }`}
    >
      {/* Sidebar Header with "+ Create" Button and Collapse Icon */}
      <div className="pt-4 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#303134] hover:bg-bg-tertiary text-text-primary dark:text-white rounded-full text-xs font-semibold shadow-sm border border-border-primary/50 transition-all hover:shadow active:scale-95 cursor-pointer group"
        >
          {/* Multi-colored Google-style Plus Icon */}
          <span className="relative flex items-center justify-center w-4 h-4">
            <span className="absolute w-3.5 h-0.5 bg-[#1a73e8] rounded-full group-hover:scale-110 transition-transform"></span>
            <span className="absolute w-0.5 h-3.5 bg-[#34a853] rounded-full group-hover:scale-110 transition-transform"></span>
            <span className="absolute w-2 h-0.5 bg-[#f9ab00] rounded-full group-hover:scale-110 transition-transform"></span>
            <span className="absolute w-0.5 h-2 bg-[#ea4335] rounded-full group-hover:scale-110 transition-transform"></span>
          </span>
          <span className="text-[#3c4043] dark:text-white tracking-wide">Create Workspace</span>
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-primary hover:text-text-heading cursor-pointer transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={20} className="stroke-[2.2]" />
          </button>
        )}
      </div>

      {/* Scrollable Sidebar Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
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

        {/* MY WORKSPACES */}
        <div>
          <span className="px-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">
            My Workspaces
          </span>
          <div className="space-y-1">
            {workspaces.map((space) => {
              const isSelected = selectedTagFilter === space.workspaceKey;
              const color = colorForWorkspace(space.workspaceKey);
              return (
                <button
                  key={space.id}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Filter by ${space.name}`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTagFilter(null);
                    } else {
                      setSelectedTagFilter(space.workspaceKey);
                      setActiveSection('tasks');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1 rounded-lg text-left text-xs font-medium hover:bg-bg-tertiary/60 transition-all cursor-pointer group`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: isSelected ? color : 'transparent',
                        borderColor: color
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
                      {space.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    {tasks.filter(t => t.tag === space.workspaceKey).length}
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
