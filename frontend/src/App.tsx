import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { useBoardStore, type Task } from './store/boardStore';
import { formatMonthYear, getToday } from './utils/date';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { HomeView } from './components/HomeView';
import { AIWriterView } from './components/AIWriterView';
import { DataInsightsView } from './components/DataInsightsView';
import { AIPanel } from './components/AIPanel';
import { TaskModal } from './components/TaskModal';
import { TaskCard } from './components/TaskCard';
import { ContactsView } from './components/contacts/ContactsView';
import { AcceptInvite } from './components/contacts/AcceptInvite';
import { NotesView } from './components/notes/NotesView';
import { QuickCapturePopover } from './components/notes/QuickCapturePopover';
import { MessagesPanel } from './components/chat/MessagesPanel';
import { useChatStore, totalUnread } from './store/chatStore';
import { ToastHost } from './components/ui/ToastHost';
import { useClickAway } from './hooks/useClickAway';
import { AuthPage } from './components/auth';
import { useAuthStore } from './store/authStore';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { useNotesStore } from './store/notesStore';
import { useContactsStore } from './store/contactsStore';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';
import { useWorkspaceStore } from './store/workspaceStore';
import {
  HelpCircle,
  Settings,
  Search,
  Zap,
  Grid,
  Smartphone,
  Plus,
  X,
  LogOut,
  Sun,
  Moon,
  MessageSquare,
  PanelLeftOpen
} from 'lucide-react';

const COLUMN_IDS = ['todo', 'doing', 'done'];

function App() {
  const {
    fetchUsers,
    fetchTasks,
    moveTask,
    theme,
    toggleTheme,
    tasks,
    searchQuery,
    setSearchQuery,
    showToast
  } = useBoardStore();

  // Auth session is owned by the store (JWT access in memory, refresh token in localStorage).
  const authStatus = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const ingestOAuthTokens = useAuthStore((s) => s.ingestOAuthTokens);
  const logout = useAuthStore((s) => s.logout);
  const currentUser = useAuthStore((s) => s.user);
  const activeTenantId = useAuthStore((s) => s.activeTenantId);
  const isAuthenticated = authStatus === 'authenticated';
  // Invite acceptance is reachable pre-auth via a ?invite=<token> link.
  const [inviteToken, setInviteToken] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('invite')
  );
  // Remember the last open page across refreshes.
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem('trackflows-section') || 'home'
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('todo');

  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const unreadMessages = useChatStore(totalUnread);

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useClickAway(profileRef, () => setShowProfileMenu(false), showProfileMenu);

  // Configure sensors for touch and pointer drag control to prevent accidental drag triggers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires cursor move of 8px before dragging, allowing clean clicks on cards to edit!
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Holding for 200ms triggers touch-based drag
        tolerance: 5,
      },
    })
  );

  // On mount: consume a Google OAuth redirect (tokens in the URL fragment) or restore
  // an existing session from the persisted refresh token.
  useEffect(() => {
    const isOAuthCallback = window.location.pathname.startsWith('/oauth/callback');
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = fragment.get('accessToken');
    const refreshToken = fragment.get('refreshToken');
    if (isOAuthCallback || (accessToken && refreshToken)) {
      window.history.replaceState(null, '', '/');
      if (accessToken && refreshToken) {
        ingestOAuthTokens(accessToken, refreshToken).catch(() => bootstrap());
      } else {
        bootstrap();
      }
      return;
    }
    bootstrap();
  }, [bootstrap, ingestOAuthTokens]);

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const selectedTagFilter = useBoardStore((s) => s.selectedTagFilter);

  // Load board users, notes, members and workspaces once authenticated or tenant switches.
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      useNotesStore.getState().fetchNotes();
      useWorkspaceStore.getState().fetchWorkspaces();
      useBoardStore.getState().fetchAvailableTags();
      if (activeTenantId) {
        useContactsStore.getState().fetchMembers(activeTenantId);
      }
    }
  }, [isAuthenticated, activeTenantId, fetchUsers]);

  // Fetch tasks/tickets whenever workspaces or the selected workspace filter changes
  useEffect(() => {
    if (isAuthenticated && workspaces.length > 0) {
      fetchTasks();
    }
  }, [isAuthenticated, workspaces, selectedTagFilter, fetchTasks]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist the current section so a page refresh restores it.
  useEffect(() => {
    localStorage.setItem('trackflows-section', activeSection);
  }, [activeSection]);

  const handleOpenCreateModal = (status: Task['status']) => {
    setSelectedTask(undefined);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const handleCreateWorkspaceClick = () => {
    const roles = useAuthStore.getState().roles || [];
    const isAdmin = roles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ROLE_ADMIN');
    if (isAdmin) {
      setIsCreateWorkspaceOpen(true);
    } else {
      showToast('Only administrators can create workspaces.', 'error');
    }
  };

  // Global keyboard shortcuts: "/" focuses search, "N" creates a task.
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (typing) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n' && !isModalOpen) {
        e.preventDefault();
        handleOpenCreateModal('todo');
      } else if (e.key.toLowerCase() === 'q' && !isModalOpen) {
        e.preventDefault();
        setShowQuickNote(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAuthenticated, isModalOpen]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    if (overId === taskId) return;

    // The drop target is either a column (status) or another card.
    let newStatus: Task['status'];
    if (COLUMN_IDS.includes(overId)) {
      newStatus = overId as Task['status'];
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      newStatus = overTask ? overTask.status : (tasks.find((t) => t.id === taskId)?.status ?? 'todo');
    }

    moveTask(taskId, newStatus, overId);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Search only affects the board — jump there so results are visible.
    if (value && activeSection !== 'tasks') setActiveSection('tasks');
  };

  const comingSoon = (label: string) => showToast(`${label} is coming soon`, 'info');

  const handleSignOut = () => {
    setShowProfileMenu(false);
    logout();
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  // Invite-acceptance link takes priority over everything else.
  if (inviteToken) {
    return (
      <AcceptInvite
        token={inviteToken}
        onDone={() => {
          window.history.replaceState(null, '', window.location.pathname);
          setInviteToken(null);
        }}
      />
    );
  }

  if (authStatus === 'loading') {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col">
        <AuthPage onAuthSuccess={() => fetchUsers()} />
      </div>
    );
  }
  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden bg-bg-primary font-sans antialiased text-text-primary ${theme}`}>

      {/* Google Calendar Style Full Width Top Header */}
      <header className="h-16 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 select-none flex-shrink-0 transition-colors duration-200">

        {/* Left Section: Menu, Logo, Date Navigation */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              className="p-2 hover:bg-bg-tertiary rounded-full text-text-primary transition-all cursor-pointer animate-fade-in"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow shadow-purple-500/20">
              <Zap size={18} className="fill-white/20" />
            </div>
            <span className="font-bold text-lg text-text-heading tracking-tight hidden sm:block">
              TrackFlows
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-4">
            <button
              onClick={() => setActiveSection('home')}
              className="px-4 py-1.5 border border-border-primary rounded-md text-xs font-semibold text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
            >
              Today
            </button>
            <span className="text-base font-medium text-text-heading ml-1 hidden md:block">
              {formatMonthYear(getToday())}
            </span>
          </div>
        </div>

        {/* Center Section: Google Calendar Style Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <label htmlFor="global-search" className="sr-only">Search tasks</label>
            <input
              id="global-search"
              ref={searchRef}
              type="text"
              placeholder="Search tasks, descriptions…  ( press / )"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-bg-tertiary hover:bg-bg-tertiary focus:bg-bg-secondary border-2 border-transparent focus:border-indigo-500/30 focus:shadow-md rounded-full py-2 pl-12 pr-10 text-sm outline-none transition-all text-text-primary placeholder-text-secondary"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-bg-secondary cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Utilities, Theme Toggle, Profile */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          <button onClick={() => comingSoon('Help center')} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary dark:text-text-primary hover:text-text-primary dark:hover:text-white cursor-pointer" aria-label="Help" title="Help">
            <HelpCircle size={18} />
          </button>

          <button onClick={() => setActiveSection('settings')} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary dark:text-text-primary hover:text-text-primary dark:hover:text-white cursor-pointer" aria-label="Settings" title="Settings">
            <Settings size={18} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary dark:text-text-primary hover:text-text-primary dark:hover:text-white cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={() => comingSoon('Apps grid')} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary dark:text-text-primary hover:text-text-primary dark:hover:text-white cursor-pointer" aria-label="Apps grid" title="Apps">
            <Grid size={18} />
          </button>

          {/* User profile initials avatar + menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((s) => !s)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
              className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold cursor-pointer border-2 border-transparent hover:border-indigo-600/30 transition-all shadow-sm"
            >
              {currentUser
                ? `${currentUser.firstName?.[0] ?? ''}${currentUser.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
                : 'U'}
            </button>
            {showProfileMenu && (
              <div role="menu" className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-border-primary/50 mb-1">
                  <p className="text-xs font-semibold text-text-heading">{currentUser?.fullName ?? 'Account'}</p>
                  <p className="text-[10px] text-text-secondary truncate">{currentUser?.email ?? ''}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => { toggleTheme(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setShowProfileMenu(false); setActiveSection('settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer"
                >
                  <Settings size={14} />
                  <span>Account settings</span>
                </button>
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Bottom Section: Sidebar + Subviews */}
      <div className="flex flex-row flex-grow overflow-hidden relative">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* Left Sidebar */}
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onAddTask={handleCreateWorkspaceClick}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(true)}
          />

          {/* Center Kanban Board / Main Content */}
          <div className="flex-grow flex flex-col h-full relative overflow-hidden">
            {activeSection === 'tasks' ? (
              <KanbanBoard
                onEditTask={handleOpenEditModal}
                onAddTask={handleOpenCreateModal}
              />
            ) : activeSection === 'home' ? (
              <HomeView
                onAddTask={handleOpenCreateModal}
                onOpenBoard={() => setActiveSection('tasks')}
              />
            ) : activeSection === 'workflows' ? (
              <WorkflowBuilder onBack={() => setActiveSection('home')} />
            ) : activeSection === 'ai-writer' ? (
              <AIWriterView />
            ) : activeSection === 'data-insights' ? (
              <DataInsightsView
                showAIPanel={showAIPanel}
                onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
              />
            ) : activeSection === 'contacts' ? (
              <ContactsView />
            ) : activeSection === 'notes' ? (
              <NotesView />
            ) : activeSection === 'settings' ? (
              <ProfileSettingsView />
            ) : (
              <div className="flex-grow flex items-center justify-center p-8 text-center select-none">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                    <Smartphone size={24} />
                  </div>
                  <h2 className="text-sm font-semibold text-text-heading capitalize">{activeSection.replace('-', ' ')}</h2>
                  <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                    This section isn't available yet. Head to the Tasks Board to manage your active sprint.
                  </p>
                  <button
                    onClick={() => setActiveSection('tasks')}
                    className="bg-purple-600/15 hover:bg-purple-600/35 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white rounded-lg py-1.5 px-4 text-xs font-semibold transition-all transform active:scale-95 cursor-pointer"
                  >
                    View Tasks Board
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right AI assistant panel (only on data insights page) */}
          {showAIPanel && activeSection === 'data-insights' && <AIPanel onClose={() => setShowAIPanel(false)} />}

          {/* Team messaging panel (available on any page) */}
          {showMessages && <MessagesPanel onClose={() => setShowMessages(false)} />}

          {/* Google Calendar style Right Side Icon Bar */}
          <div className="w-12 border-l border-border-primary bg-bg-secondary flex flex-col items-center py-4 gap-6 flex-shrink-0 transition-colors duration-200 select-none">
            {/* Notes Icon — quick capture */}
            <button
              onClick={() => setShowQuickNote(true)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                showQuickNote || activeSection === 'notes'
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300'
                  : 'hover:bg-bg-tertiary text-yellow-500'
              }`}
              aria-label="Quick note"
              aria-haspopup="dialog"
              title="Quick note (Q)"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
              </svg>
            </button>

            {/* Tasks Icon */}
            <button
              onClick={() => setActiveSection('tasks')}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-bg-tertiary text-blue-500 dark:text-blue-400 transition-all cursor-pointer"
              aria-label="Tasks board"
              title="Tasks Board"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>

            {/* Contacts Icon */}
            <button
              onClick={() => setActiveSection('contacts')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeSection === 'contacts'
                  ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-bg-tertiary text-blue-500'
              }`}
              aria-label="Contacts"
              title="Contacts"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>

            {/* Messages Icon */}
            <button
              onClick={() => setShowMessages((s) => !s)}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                showMessages
                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
                  : 'hover:bg-bg-tertiary text-purple-500'
              }`}
              aria-label={unreadMessages > 0 ? `Messages, ${unreadMessages} unread` : 'Messages'}
              aria-pressed={showMessages}
              title="Messages"
            >
              <MessageSquare size={18} />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* TrackFlow AI Icon (Sparkles) */}
            <button
              onClick={() => {
                if (activeSection !== 'data-insights') {
                  setActiveSection('data-insights');
                  setShowAIPanel(true);
                } else {
                  setShowAIPanel(!showAIPanel);
                }
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                showAIPanel && activeSection === 'data-insights'
                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-900/30'
                  : 'hover:bg-bg-tertiary text-purple-500'
              }`}
              aria-label="TrackFlow AI assistant"
              title="TrackFlow AI Assistant (Data Insights)"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </button>

            <div className="w-5 border-t border-border-primary my-1" />

            {/* Plus Add Icon at the bottom */}
            <div className="mt-auto">
              <button onClick={() => handleOpenCreateModal('todo')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-bg-tertiary text-text-secondary cursor-pointer" aria-label="Create task" title="Create task">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Task Dialog Modal */}
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            task={selectedTask}
            defaultStatus={defaultStatus}
          />

          {/* Floating clone for fluid water-flow dragging */}
          <DragOverlay adjustScale={false}>
            {activeTask ? (
              <div className="w-[280px]">
                <TaskCard task={activeTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Quick-capture note popover (from the bulb / Q shortcut) */}
      {showQuickNote && (
        <QuickCapturePopover
          onClose={() => setShowQuickNote(false)}
          onOpenFull={() => { setShowQuickNote(false); setActiveSection('notes'); }}
        />
      )}

      {/* Global toast outlet */}
      <ToastHost />

      <CreateWorkspaceModal 
        isOpen={isCreateWorkspaceOpen} 
        onClose={() => setIsCreateWorkspaceOpen(false)} 
      />
    </div>
  );
}

export default App;
