import React from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  Link2,
  Terminal,
  Cpu,
  ChevronRight,
  ChevronDown,
  Search,
  PanelLeftClose,
  Shield,
  CreditCard
} from 'lucide-react';

export interface LibraryItem {
  label: string;
  icon: string;
  category: string;
  description: string;
}

export interface LibraryCategory {
  category: string;
  color: string;
  icon: string;
  items: LibraryItem[];
}

interface NodeLibrarySidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  collapsedCategories: { [key: string]: boolean };
  setCollapsedCategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  filteredLibrary: LibraryCategory[];
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  onDragStart: (event: React.DragEvent, nodeType: string, label: string, icon: string, category: string) => void;
}

export const NodeLibrarySidebar: React.FC<NodeLibrarySidebarProps> = ({
  searchQuery,
  setSearchQuery,
  collapsedCategories,
  setCollapsedCategories,
  filteredLibrary,
  leftSidebarCollapsed,
  setLeftSidebarCollapsed,
  onDragStart,
}) => {
  return (
    <aside className={`border-r border-border-primary bg-white dark:bg-[#202124] flex flex-col shrink-0 overflow-hidden select-none transition-all duration-200 ${
      leftSidebarCollapsed ? 'w-0 border-r-0 opacity-0 pointer-events-none' : 'w-64 opacity-100'
    }`}>
      <div className="p-3 border-b border-border-primary shrink-0 flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Node Library</span>
        <button
          onClick={() => setLeftSidebarCollapsed(true)}
          className="p-1.5 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
          title="Collapse Node Library"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>
      <div className="p-3 border-b border-border-primary shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes, integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-primary rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-text-secondary/70"
          />
          <Search className="absolute left-2.5 top-2 text-text-secondary/70" size={13} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {filteredLibrary.map((category) => {
          const isCollapsed = collapsedCategories[category.category];
          return (
            <div key={category.category} className="space-y-1">
              <button
                onClick={() =>
                  setCollapsedCategories((prev) => ({
                    ...prev,
                    [category.category]: !prev[category.category],
                  }))
                }
                className="flex items-center justify-between w-full px-2 py-1 text-xs font-bold text-text-heading hover:bg-bg-tertiary rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={category.color}>
                    {category.category === 'Triggers' ? (
                      <Activity size={12} />
                    ) : category.category === 'Logic' ? (
                      <Layers size={12} />
                    ) : category.category === 'AI' ? (
                      <Sparkles size={12} />
                    ) : category.category === 'Authentication' ? (
                      <Shield size={12} />
                    ) : category.category === 'Payments & Billing' ? (
                      <CreditCard size={12} />
                    ) : category.category === 'Integrations' ? (
                      <Link2 size={12} />
                    ) : (
                      <Terminal size={12} />
                    )}
                  </span>
                  <span>{category.category}</span>
                </div>
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-1.5 pl-1.5 pt-0.5">
                  {category.items.map((item) => (
                    <div
                      key={item.label}
                      draggable
                      onDragStart={(e) => onDragStart(e, 'custom', item.label, item.icon, item.category)}
                      className="flex flex-col p-2 bg-[#f8f9fa] dark:bg-[#282a2d] border border-border-primary rounded-lg cursor-grab hover:border-purple-500 dark:hover:border-purple-500/60 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">
                          <Cpu size={12} />
                        </span>
                        <span className="text-xs font-semibold text-text-heading">{item.label}</span>
                      </div>
                      <span className="text-[9.5px] text-text-secondary mt-1 leading-relaxed truncate">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
