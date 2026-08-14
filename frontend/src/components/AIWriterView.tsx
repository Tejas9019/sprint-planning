import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Globe, 
  HardDrive, 
  Trash2, 
  Send, 
  Check, 
  PanelLeftClose, 
  PanelLeft, 
  BookOpen, 
  MoreVertical, 
  Search, 
  ArrowRight,
  TrendingUp,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { aiApi } from '../lib/api';

interface Source {
  id: string;
  name: string;
  type: 'pdf' | 'web' | 'text' | 'drive';
  size?: string;
  selected: boolean;
  content: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // ISO string for local storage compatibility
}

interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  messages: Message[];
}

const LOCAL_STORAGE_KEY = 'trackflows-notebooks-storage';
const ACTIVE_NOTEBOOK_KEY = 'trackflows-active-notebook-id';

const defaultNotebooks: Notebook[] = [
  {
    id: 'nb_sprint_specs',
    title: 'Sprint Specifications',
    sources: [
      {
        id: 's1',
        name: 'Sprint Planning Requirements.pdf',
        type: 'pdf',
        size: '2.4 MB',
        selected: true,
        content: 'This document details the board architecture, the Kanban workflow stages (To Do, Doing, Done), and the need for a fluid drag-and-drop feel.'
      },
      {
        id: 's2',
        name: 'Acceptance Criteria.text',
        type: 'text',
        size: '1.2 KB',
        selected: true,
        content: 'Acceptance criteria: tasks support priority and due dates, the calendar reflects live data, and all dialogs are keyboard accessible.'
      }
    ],
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'What workflow stages does the board use?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'Based on the selected sources, the board uses three workflow stages: **To Do**, **Doing**, and **Done**. Cards can be dragged within and across these columns.',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: 'nb_roadmap',
    title: 'TrackFlows AI Roadmap',
    sources: [
      {
        id: 's3',
        name: 'TrackFlows AI Roadmap.web',
        type: 'web',
        size: '14 KB',
        selected: true,
        content: 'Roadmap outlining data insights dashboard release in Q3, AI Writer launch, and chatbot stress testing metrics under 200ms latency.'
      }
    ],
    messages: [
      {
        id: 'm3',
        sender: 'user',
        text: 'When does the AI Writer launch?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'm4',
        sender: 'ai',
        text: 'According to your notebook source "TrackFlows AI Roadmap.web", the AI Writer workspace and layout release is scheduled to launch in Q3, alongside the Data Insights dashboard.',
        timestamp: new Date().toISOString()
      }
    ]
  }
];

// Safely read persisted notebooks; corrupt storage falls back to defaults instead of crashing.
const loadNotebooks = (): Notebook[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as Notebook[]) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultNotebooks;
  } catch {
    return defaultNotebooks;
  }
};

export const AIWriterView: React.FC = () => {
  // Notebook States
  const [notebooks, setNotebooks] = useState<Notebook[]>(loadNotebooks);

  const [activeNotebookId, setActiveNotebookId] = useState<string>(() => {
    const savedId = localStorage.getItem(ACTIVE_NOTEBOOK_KEY);
    if (savedId) return savedId;
    return loadNotebooks()[0]?.id || 'nb_sprint_specs';
  });

  // UI Drawer Toggles
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
  const [isNotebooksOpen, setIsNotebooksOpen] = useState(true);
  const [isSourcesOpen, setIsSourcesOpen] = useState(true);

  // Editing Notebook Title States
  const [notebookTitle, setNotebookTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Message & Input states
  const [chatInput, setChatInput] = useState('');
  const [webSearchInput, setWebSearchInput] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);

  // New Source Form States
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<Source['type']>('pdf');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [uploadedSourceId, setUploadedSourceId] = useState<string | null>(null);

  // File Upload State
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploadingFile(true);
    triggerToast(`Parsing and uploading ${file.name}...`);
    try {
      const res = await aiApi.uploadDocument(file);
      setNewSourceName(res.filename);
      setNewSourceContent(res.content);
      setUploadedSourceId(res.id); // Save backend generated UUID source id
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setNewSourceType('pdf');
      else setNewSourceType('text');
      
      triggerToast(`Successfully parsed and loaded ${file.name}!`);
    } catch (err: any) {
      console.error(err);
      triggerToast(`Failed to parse file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // UI Toast & Loading States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute Active Notebook properties dynamically
  const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0] || {
    id: 'default',
    title: 'Untitled notebook',
    sources: [],
    messages: []
  };

  // Sync title text box when switching notebooks
  useEffect(() => {
    if (activeNotebook) {
      setNotebookTitle(activeNotebook.title);
    }
  }, [activeNotebookId, activeNotebook?.title]);

  // Persist states to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_NOTEBOOK_KEY, activeNotebookId);
  }, [activeNotebookId]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeNotebook.messages, isTyping]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Notebook handlers
  const handleCreateNotebook = () => {
    const newId = `nb_${Date.now()}`;
    const newNb: Notebook = {
      id: newId,
      title: `Untitled notebook ${notebooks.length + 1}`,
      sources: [],
      messages: []
    };
    setNotebooks([...notebooks, newNb]);
    setActiveNotebookId(newId);
    triggerToast("Created new empty notebook");
  };

  const handleDeleteNotebook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting it before deletion
    const filtered = notebooks.filter(n => n.id !== id);
    setNotebooks(filtered);
    triggerToast("Deleted notebook");

    if (activeNotebookId === id) {
      if (filtered.length > 0) {
        setActiveNotebookId(filtered[0].id);
      } else {
        // Automatically create a new empty one if list is dry
        const fallbackId = `nb_${Date.now()}`;
        const fallbackNb: Notebook = {
          id: fallbackId,
          title: 'Untitled notebook 1',
          sources: [],
          messages: []
        };
        setNotebooks([fallbackNb]);
        setActiveNotebookId(fallbackId);
      }
    }
  };

  const handleRenameNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (notebookTitle.trim() === '') return;

    setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, title: notebookTitle.trim() } : n));
    setIsEditingTitle(false);
  };

  // Source handlers
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSourceName.trim() === '') return;

    const size = newSourceType === 'pdf' ? '1.8 MB' : newSourceType === 'web' ? '12 KB' : newSourceType === 'drive' ? '45 KB' : '2 KB';
    const content = newSourceContent.trim() || `Mock content generated for ${newSourceName}`;
    
    const newSource: Source = {
      id: uploadedSourceId || `source_${Date.now()}`,
      name: newSourceName.endsWith(`.${newSourceType}`) ? newSourceName : `${newSourceName}.${newSourceType}`,
      type: newSourceType,
      size,
      selected: true,
      content
    };

    setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, sources: [...n.sources, newSource] } : n));
    setNewSourceName('');
    setNewSourceContent('');
    setUploadedSourceId(null); // Reset tracking state
    setIsAddingSource(false);
    triggerToast(`Added source: ${newSource.name}`);
  };

  const handleDeleteSource = async (sourceId: string, name: string) => {
    try {
      // Trigger deletion in ChromaDB vector store
      await aiApi.deleteSource(sourceId);
    } catch (err) {
      console.error("Failed to delete source from vector store:", err);
    }
    setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, sources: n.sources.filter(s => s.id !== sourceId) } : n));
    triggerToast(`Deleted source: ${name}`);
  };

  const toggleSourceSelection = (sourceId: string) => {
    setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? {
      ...n,
      sources: n.sources.map(s => s.id === sourceId ? { ...s, selected: !s.selected } : s)
    } : n));
  };

  const handleWebSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (webSearchInput.trim() === '') return;

    setIsSearchingWeb(true);
    triggerToast(`Searching the web for: "${webSearchInput}"...`);

    setTimeout(async () => {
      // For web search, we index it into the vector store first
      const contentText = `Search result data from the web regarding: ${webSearchInput}. This resource contains high-relevance matches.`;
      const filename = `${webSearchInput.slice(0, 20)}.web`;
      let webSourceId = `web_${Date.now()}`;
      
      try {
        // Create mock file structure to index in ChromaDB
        const blob = new Blob([contentText], { type: 'text/plain' });
        const fileObj = new File([blob], filename, { type: 'text/plain' });
        const res = await aiApi.uploadDocument(fileObj);
        webSourceId = res.id;
      } catch (err) {
        console.error("Failed to index web source:", err);
      }

      const newSource: Source = {
        id: webSourceId,
        name: filename,
        type: 'web',
        size: '8 KB',
        selected: true,
        content: contentText
      };

      setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, sources: [...n.sources, newSource] } : n));
      setWebSearchInput('');
      setIsSearchingWeb(false);
      triggerToast(`Imported web source: ${newSource.name}`);
    }, 1500);
  };

  // Chat handlers
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (text.trim() === '') return;

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, messages: [...n.messages, userMsg] } : n));
    if (!textToSend) setChatInput('');

    // Generate AI response based on selected sources
    setIsTyping(true);
    const selectedSources = activeNotebook.sources.filter(s => s.selected);

    if (selectedSources.length === 0) {
      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: "👋 Please select or upload at least one source in the left panel so I can analyze and answer questions based on your notebook's resources.",
        timestamp: new Date().toISOString()
      };
      setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, messages: [...n.messages, aiMsg] } : n));
      setIsTyping(false);
      return;
    }

    try {
      const sourceIds = selectedSources.map(s => s.id);
      const res = await aiApi.writerChat(text, sourceIds);
      
      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: res.text,
        timestamp: new Date().toISOString()
      };
      setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, messages: [...n.messages, aiMsg] } : n));
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: "Sorry, I am unable to process your request. Please ensure the AI service is running and configured.",
        timestamp: new Date().toISOString()
      };
      setNotebooks(prev => prev.map(n => n.id === activeNotebookId ? { ...n, messages: [...n.messages, errorMsg] } : n));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (type: string) => {
    let text = '';
    if (type === 'project') text = "Draft a detailed project plan based on the uploaded requirements";
    else if (type === 'understand') text = "Summarize the key takeaways and specs from my sources";
    else if (type === 'podcast') text = "Generate a podcast script overview summarizing the AI roadmap";
    else text = "Explain how we can improve sprint planning based on these files";
    
    handleSendMessage(text);
  };

  const selectedSourcesCount = activeNotebook.sources?.filter(s => s.selected).length || 0;

  return (
    <main className="flex-grow flex flex-col h-screen bg-bg-primary overflow-hidden text-text-primary transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-6 right-6 z-50 bg-bg-secondary/85 backdrop-blur-md border border-purple-500/30 dark:border-purple-500/20 text-text-primary px-4.5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 ring-1 ring-purple-500/10">
          <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold text-text-heading">{toastMessage}</span>
        </div>
      )}

      {/* Notebook Top Header */}
      <header className="p-4 border-b border-border-primary/50 flex items-center justify-between select-none bg-bg-secondary/20 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <BookOpen size={16} />
          </div>
          
          {/* Editable Title */}
          {isEditingTitle ? (
            <form onSubmit={handleRenameNotebook} className="flex items-center">
              <input
                type="text"
                value={notebookTitle}
                onChange={(e) => setNotebookTitle(e.target.value)}
                onBlur={handleRenameNotebook}
                className="bg-bg-primary border border-purple-500/50 rounded px-2 py-0.5 text-xs font-semibold text-text-heading outline-none focus:ring-1 focus:ring-purple-500/30"
                autoFocus
              />
            </form>
          ) : (
            <h1 className="font-bold text-text-heading text-sm">
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                aria-label={`Rename notebook: ${notebookTitle}`}
                className="hover:bg-bg-tertiary/60 px-2 py-1 rounded cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
                title="Click to rename"
              >
                {notebookTitle}
              </button>
            </h1>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateNotebook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer transform active:scale-95"
          >
            <Plus size={12} />
            <span>Create notebook</span>
          </button>
          <button
            onClick={() => triggerToast(`Analytics: ${notebooks.length} notebooks, ${notebooks.reduce((acc, n) => acc + (n.sources?.length || 0), 0)} sources total.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <TrendingUp size={12} className="text-text-secondary" />
            <span>Analytics</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body: Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Double Drawers (Notebooks + Sources) */}
        <div 
          className={`bg-bg-secondary/40 border-r border-border-primary/50 flex flex-col h-full transition-all duration-300 ${
            isSourcesCollapsed ? 'w-12' : 'w-80'
          }`}
        >
          {/* Main Drawer Header */}
          <div className="p-4 flex items-center justify-between border-b border-border-primary/30 select-none">
            {!isSourcesCollapsed && (
              <span className="text-xs font-bold uppercase tracking-wider text-text-heading">Workspace</span>
            )}
            <button
              onClick={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
              aria-label={isSourcesCollapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar'}
              aria-expanded={!isSourcesCollapsed}
              className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-bg-tertiary transition-colors cursor-pointer"
              title={isSourcesCollapsed ? 'Expand Workspace Sidebar' : 'Collapse Workspace Sidebar'}
            >
              {isSourcesCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>

          {!isSourcesCollapsed && (
            <div className="flex-1 flex flex-col overflow-y-auto divide-y divide-border-primary/30">
              
              {/* ACCORDION 1: MY NOTEBOOKS */}
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => setIsNotebooksOpen(!isNotebooksOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors cursor-pointer"
                >
                  <span>My Notebooks ({notebooks.length})</span>
                  {isNotebooksOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {isNotebooksOpen && (
                  <div className="space-y-1 mt-2 max-h-40 overflow-y-auto pr-0.5">
                    {notebooks.map(nb => {
                      const isActive = nb.id === activeNotebookId;
                      return (
                        <div
                          key={nb.id}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-l-2 border-purple-500 font-semibold shadow-sm shadow-purple-500/5'
                              : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveNotebookId(nb.id)}
                            aria-label={`Open notebook: ${nb.title}`}
                            aria-current={isActive ? 'true' : undefined}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded"
                          >
                            <BookOpen size={12} className={isActive ? 'text-purple-600 dark:text-purple-400' : 'text-text-secondary'} />
                            <span className="truncate max-w-[170px]">{nb.title}</span>
                          </button>

                          <button
                            onClick={(e) => handleDeleteNotebook(nb.id, e)}
                            aria-label={`Delete notebook: ${nb.title}`}
                            className="text-text-secondary/50 hover:text-red-500 p-0.5 rounded transition-colors"
                            title="Delete Notebook"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      );
                    })}

                    <button
                      onClick={handleCreateNotebook}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-2 bg-purple-600/10 border border-dashed border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>New Notebook</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ACCORDION 2: SOURCES FOR ACTIVE NOTEBOOK */}
              <div className="p-4 space-y-4 flex-grow flex flex-col">
                <button 
                  onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors cursor-pointer"
                >
                  <span>Active Sources ({activeNotebook.sources?.length || 0})</span>
                  {isSourcesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {isSourcesOpen && (
                  <div className="flex-1 flex flex-col space-y-4 mt-2">
                    
                    {/* Add Sources Action Button */}
                    <button
                      onClick={() => setIsAddingSource(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-dashed border-border-primary hover:border-purple-500/30 text-text-primary rounded-xl text-xs font-semibold transition-all cursor-pointer group"
                    >
                      <Plus size={13} className="text-text-secondary group-hover:text-purple-600" />
                      <span>Add sources</span>
                    </button>

                    {/* Web Search */}
                    <form onSubmit={handleWebSearch} className="space-y-1.5">
                      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block select-none">
                        Search web for sources
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search queries/URLs..."
                          value={webSearchInput}
                          onChange={(e) => setWebSearchInput(e.target.value)}
                          disabled={isSearchingWeb}
                          className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-xl py-1.5 pl-3 pr-9 text-xs outline-none text-text-primary transition-all placeholder-text-secondary"
                        />
                        <button
                          type="submit"
                          disabled={isSearchingWeb}
                          aria-label="Search the web for sources"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-purple-600 p-1 rounded cursor-pointer"
                        >
                          {isSearchingWeb ? (
                            <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Search size={13} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 select-none">
                        <span className="text-[8px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-medium">
                          Web ▾
                        </span>
                        <span className="text-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-medium">
                          Fast Research ▾
                        </span>
                      </div>
                    </form>

                    {/* Sources Checkbox Checklist */}
                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-64 pr-0.5">
                      {activeNotebook.sources?.map(source => {
                        const SourceIcon = source.type === 'pdf' ? FileText : source.type === 'web' ? Globe : source.type === 'drive' ? HardDrive : FileText;
                        return (
                          <div 
                            key={source.id}
                            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                              source.selected 
                                ? 'bg-purple-600/5 border-purple-500/20' 
                                : 'bg-bg-primary/20 border-border-primary/50 hover:bg-bg-tertiary/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                onClick={() => toggleSourceSelection(source.id)}
                                role="checkbox"
                                aria-checked={source.selected}
                                aria-label={`Use source: ${source.name}`}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                  source.selected
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'border-border-primary bg-bg-primary'
                                }`}
                              >
                                {source.selected && <Check size={10} className="stroke-[3]" />}
                              </button>

                              <SourceIcon size={13} className="text-text-secondary flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[11px] font-medium text-text-heading truncate max-w-[130px]" title={source.name}>
                                  {source.name}
                                </p>
                                {source.size && (
                                  <span className="text-[8px] text-text-secondary/80 block">{source.size}</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteSource(source.id, source.name)}
                              aria-label={`Delete source: ${source.name}`}
                              className="text-text-secondary/60 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                              title="Delete source"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        );
                      })}

                      {(!activeNotebook.sources || activeNotebook.sources.length === 0) && (
                        <div className="flex-grow flex flex-col items-center justify-center py-6 text-center select-none space-y-1.5">
                          <FileText size={22} className="text-text-secondary/30" />
                          <p className="text-[10px] font-bold text-text-heading">No sources uploaded</p>
                          <p className="text-[9px] text-text-secondary max-w-[160px] leading-relaxed">
                            Add documents to let the assistant search and write about this notebook.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Right Side: Chat Panel */}
        <div className="flex-1 flex flex-col h-full bg-bg-primary/20">
          
          {/* Chat Panel Header */}
          <div className="p-4 border-b border-border-primary/30 flex items-center justify-between bg-bg-secondary/5">
            <span className="text-xs font-bold uppercase tracking-wider text-text-heading">Chat</span>
            <button
              onClick={() => triggerToast(`Consulting ${selectedSourcesCount} sources in "${activeNotebook.title}"`)}
              aria-label="Chat options"
              className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-bg-tertiary transition-colors cursor-pointer"
            >
              <MoreVertical size={14} />
            </button>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {(!activeNotebook.messages || activeNotebook.messages.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-5 py-8 select-none animate-in fade-in duration-200">
                <span className="text-3xl animate-wiggle inline-block">👋</span>
                <div className="space-y-1.5">
                  <h2 className="text-base md:text-lg font-bold text-text-heading">Let's start your notebook...</h2>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    This is your blank canvas to understand, create, or make progress on something new. I can help you get started or you can go ahead and add your own sources.
                  </p>
                </div>

                {/* Suggestions Section */}
                <div className="w-full space-y-2.5">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block text-left">
                    What would you like this notebook to help you do?
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleSuggestionClick('project')}
                      className="w-full text-left px-4 py-2.5 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary hover:border-purple-500/20 rounded-xl text-xs font-semibold text-text-primary transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-sm"
                    >
                      <span>Start a project</span>
                      <ArrowRight size={12} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => handleSuggestionClick('understand')}
                      className="w-full text-left px-4 py-2.5 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary hover:border-purple-500/20 rounded-xl text-xs font-semibold text-text-primary transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-sm"
                    >
                      <span>Learn or understand something</span>
                      <ArrowRight size={12} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => handleSuggestionClick('podcast')}
                      className="w-full text-left px-4 py-2.5 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary hover:border-purple-500/20 rounded-xl text-xs font-semibold text-text-primary transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-sm"
                    >
                      <span>Create a podcast outline / scripts</span>
                      <ArrowRight size={12} className="text-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation timeline mapping */}
            {activeNotebook.messages?.map(message => (
              <div 
                key={message.id}
                className={`flex gap-3 max-w-2xl animate-in fade-in duration-150 ${
                  message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Profile Avatar bubble */}
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                  message.sender === 'user'
                    ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    : 'bg-bg-secondary border-border-primary text-text-heading'
                }`}>
                  {message.sender === 'user' ? 'U' : 'AI'}
                </div>

                {/* Message text bubble */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-bg-secondary border border-border-primary text-text-primary rounded-tl-none shadow-sm shadow-purple-500/5'
                }`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}

            {/* AI Typing Loader Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-2xl">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border bg-bg-secondary border-border-primary text-text-heading">
                  AI
                </div>
                <div className="p-3 bg-bg-secondary border border-border-primary text-text-primary rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer Input Area */}
          <div className="p-4 bg-transparent select-none">
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-bg-secondary/60 backdrop-blur-md border border-border-primary rounded-2xl p-2 focus-within:border-purple-500/40 transition-all shadow-md">
                <textarea
                  placeholder="Ask a question or create something..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  className="w-full bg-transparent resize-none outline-none text-xs text-text-primary placeholder-text-secondary/70 p-2 pr-16"
                />
                
                {/* Send action controls */}
                <div className="absolute right-3.5 bottom-3 flex items-center gap-2.5 select-none">
                  <span className="text-[10px] text-text-secondary/80 font-bold">
                    {selectedSourcesCount} {selectedSourcesCount === 1 ? 'source' : 'sources'}
                  </span>
                  
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={chatInput.trim() === ''}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      chatInput.trim() !== ''
                        ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow'
                        : 'bg-bg-tertiary text-text-secondary/40 cursor-not-allowed'
                    }`}
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Add Source Modal Dialog overlay */}
      {isAddingSource && (
        <Modal isOpen onClose={() => setIsAddingSource(false)} labelledBy="add-source-title" className="w-full max-w-md">
          <div className="bg-bg-secondary border border-border-primary w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4">

            <button
              onClick={() => setIsAddingSource(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-tertiary cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="space-y-1 select-none">
              <h3 id="add-source-title" className="text-sm font-bold text-text-heading uppercase tracking-wide">Add Source Documents</h3>
              <p className="text-[11px] text-text-secondary">Import URLs, upload text blocks, or configure mock PDF layouts.</p>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4">
              {/* File Upload Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-primary hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-bg-primary/40 hover:bg-bg-primary/70 flex flex-col items-center justify-center gap-2 group select-none"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileChange} 
                  accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv"
                  className="hidden" 
                />
                {isUploadingFile ? (
                  <div className="flex flex-col items-center gap-1.5 animate-pulse">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Extracting content...</span>
                  </div>
                ) : (
                  <>
                    <HardDrive size={22} className="text-text-secondary group-hover:text-purple-500 transition-colors" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-text-heading block">Drag & drop document</span>
                      <span className="text-[10px] text-text-secondary block">Supports PDF, DOCX, MD, CSV, TXT</span>
                    </div>
                  </>
                )}
              </div>

              {/* Type Selectors */}
              <div className="space-y-1.5 select-none">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Resource Type</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSourceType('pdf')}
                    className={`py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 cursor-pointer ${
                      newSourceType === 'pdf' ? 'bg-purple-600/10 border-purple-500/40 text-purple-600 animate-pulse' : 'bg-bg-primary border-border-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <FileText size={14} />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSourceType('web')}
                    className={`py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 cursor-pointer ${
                      newSourceType === 'web' ? 'bg-purple-600/10 border-purple-500/40 text-purple-600 animate-pulse' : 'bg-bg-primary border-border-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSourceType('text')}
                    className={`py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 cursor-pointer ${
                      newSourceType === 'text' ? 'bg-purple-600/10 border-purple-500/40 text-purple-600 animate-pulse' : 'bg-bg-primary border-border-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <FileText size={14} />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSourceType('drive')}
                    className={`py-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 cursor-pointer ${
                      newSourceType === 'drive' ? 'bg-purple-600/10 border-purple-500/40 text-purple-600 animate-pulse' : 'bg-bg-primary border-border-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <HardDrive size={14} />
                    <span>Drive</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block select-none">Source Name</label>
                <input
                  type="text"
                  placeholder={newSourceType === 'pdf' ? 'e.g. Project Specifications' : newSourceType === 'web' ? 'e.g. www.trackflows.app/roadmap' : 'e.g. Readme parameters'}
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  required
                  className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-xl py-2 px-3 text-xs outline-none text-text-primary placeholder-text-secondary/70"
                />
              </div>

              {/* Content textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block select-none">Resource Text (Content Context)</label>
                <textarea
                  placeholder="Paste or write the document parameters here to allow the AI to synthesize answers against this specific text..."
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  rows={4}
                  className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/50 rounded-xl py-2 px-3 text-xs outline-none text-text-primary placeholder-text-secondary/70 resize-none"
                />
              </div>

              {/* Action actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 select-none">
                <button
                  type="button"
                  onClick={() => setIsAddingSource(false)}
                  className="px-4 py-2 bg-transparent hover:bg-bg-tertiary border border-border-primary hover:border-text-secondary/20 text-text-primary rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  Add Source
                </button>
              </div>
            </form>

          </div>
        </Modal>
      )}

    </main>
  );
};
