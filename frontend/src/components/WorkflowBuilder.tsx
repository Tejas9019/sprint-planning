import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MiniMap,
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  Play,
  Save,
  Activity,
  Undo2,
  Redo2,
  Users,
  PanelLeftOpen,
  Layers,
  MousePointer
} from 'lucide-react';
import { CustomNode } from './workflow/CustomNode';
import type { CustomNodeData } from './workflow/CustomNode';
import { useBoardStore } from '../store/boardStore';
import { NodeLibrarySidebar } from './workflow/NodeLibrarySidebar';
import { DebugPanel } from './workflow/DebugPanel';
import { NodeSettingsPanel } from './workflow/NodeSettingsPanel';

// Define custom node type
const nodeTypes = {
  custom: CustomNode,
};

// Node Library Categories & Items
const NODE_LIBRARY = [
  {
    category: 'Triggers',
    color: 'text-amber-500',
    icon: 'Zap',
    items: [
      { label: 'Webhook Trigger', icon: 'Zap', category: 'trigger', description: 'Trigger workflow when an external HTTP POST request is received.' },
      { label: 'Schedule Trigger', icon: 'Clock', category: 'trigger', description: 'Run workflow automatically on a basic interval time.' },
      { label: 'Cron Trigger', icon: 'Calendar', category: 'trigger', description: 'Trigger workflow run using cron expression timings.' },
      { label: 'Email Trigger', icon: 'Mail', category: 'trigger', description: 'Trigger run when a new email is received.' },
      { label: 'Database Trigger', icon: 'Database', category: 'trigger', description: 'Trigger when database table row is altered.' },
      { label: 'API Event', icon: 'Activity', category: 'trigger', description: 'Trigger when an external API webhook event is caught.' }
    ]
  },
  {
    category: 'Logic',
    color: 'text-blue-500',
    icon: 'GitBranch',
    items: [
      { label: 'If / Else Branch', icon: 'GitBranch', category: 'logic', description: 'Split execution path based on payload parameters.' },
      { label: 'Switch', icon: 'GitPullRequest', category: 'logic', description: 'Route to multiple channels based on matching keys.' },
      { label: 'Filter', icon: 'Filter', category: 'logic', description: 'Stop execution unless conditions match.' },
      { label: 'Merge Pathways', icon: 'Merge', category: 'logic', description: 'Combine parallel routes into a single thread.' },
      { label: 'Loop', icon: 'RotateCw', category: 'logic', description: 'Iterate over arrays or list items.' },
      { label: 'Delay', icon: 'Hourglass', category: 'logic', description: 'Pause workflow execution for a set duration.' },
      { label: 'Retry', icon: 'RefreshCw', category: 'logic', description: 'Retry step execution on failure.' },
      { label: 'Error Handler', icon: 'ShieldAlert', category: 'logic', description: 'Catch step exceptions and run fallback pathways.' },
      { label: 'Parallel Branch', icon: 'Split', category: 'logic', description: 'Run multiple action sequences in parallel.' }
    ]
  },
  {
    category: 'AI',
    color: 'text-purple-500',
    icon: 'Sparkles',
    items: [
      { label: 'LLM Prompt', icon: 'MessageSquare', category: 'ai', description: 'Standard LLM prompt completion block.' },
      { label: 'AI Agent Assessor', icon: 'Sparkles', category: 'ai', description: 'Autonomous agent that selects tools to fulfill prompts.' },
      { label: 'RAG Search', icon: 'Search', category: 'ai', description: 'Search vector databases to fetch context.' },
      { label: 'Embeddings', icon: 'Hash', category: 'ai', description: 'Convert text blocks into vector embeddings arrays.' },
      { label: 'AI Lead Classification', icon: 'Cpu', category: 'ai', description: 'Standard LLM categorization prompt block.' },
      { label: 'Summarizer', icon: 'FileText', category: 'ai', description: 'Summarize long text blocks or chat logs.' },
      { label: 'Content Generator', icon: 'PenTool', category: 'ai', description: 'Generate custom drafts or copywriting.' },
      { label: 'Human Review Approval', icon: 'UserCheck', category: 'logic', description: 'Pause execution for manual manager sign-off.' }
    ]
  },
  {
    category: 'Integrations',
    color: 'text-emerald-500',
    icon: 'Link2',
    items: [
      { label: 'OpenAI Connection', icon: 'Sparkles', category: 'integration', description: 'Connect directly to GPT models API.' },
      { label: 'Anthropic Connection', icon: 'Sparkles', category: 'integration', description: 'Connect directly to Claude models API.' },
      { label: 'Slack Notification', icon: 'Slack', category: 'integration', description: 'Ping specific workspace channels with custom alerts.' },
      { label: 'Discord Alert', icon: 'MessageCircle', category: 'integration', description: 'Dispatch webhook pings to Discord channels.' },
      { label: 'CRM Lead Update (Salesforce)', icon: 'Link', category: 'integration', description: 'Map variables to lead fields on Salesforce CRM.' },
      { label: 'HubSpot Connection', icon: 'Layers', category: 'integration', description: 'Update CRM contacts and deals on HubSpot.' },
      { label: 'Email Follow-up (Gmail)', icon: 'Mail', category: 'integration', description: 'Dispatch HTML custom templates to client mailboxes.' },
      { label: 'Google Sheets Append', icon: 'FileSpreadsheet', category: 'integration', description: 'Append workflow data rows into sheets.' },
      { label: 'PostgreSQL Query', icon: 'Database', category: 'developer', description: 'Run database insert, update, or select transactions.' },
      { label: 'MySQL Query', icon: 'Database', category: 'developer', description: 'Execute query statements on MySQL.' },
      { label: 'MongoDB Connection', icon: 'Database', category: 'developer', description: 'Insert document logs to Mongo database.' },
      { label: 'AWS Lambda Trigger', icon: 'Cloud', category: 'integration', description: 'Invoke serverless lambda functions.' },
      { label: 'GitHub Workflow Trigger', icon: 'Github', category: 'integration', description: 'Trigger repository Actions/Workflows runs.' }
    ]
  },
  {
    category: 'Developer',
    color: 'text-slate-500',
    icon: 'Terminal',
    items: [
      { label: 'HTTP Request API', icon: 'Globe', category: 'developer', description: 'Standard REST request wrapper (GET, POST, PUT).' },
      { label: 'GraphQL Query', icon: 'GitMerge', category: 'developer', description: 'Fetch data via GraphQL client requests.' },
      { label: 'REST API Wrapper', icon: 'Server', category: 'developer', description: 'Integrate custom API specifications.' },
      { label: 'JavaScript Execution', icon: 'Code', category: 'developer', description: 'Execute custom sandbox JavaScript blocks.' },
      { label: 'Python Script Runner', icon: 'Terminal', category: 'developer', description: 'Run secure sandbox Python code scripts.' },
      { label: 'SQL Statement Execution', icon: 'Database', category: 'developer', description: 'Run raw queries on connected database pools.' },
      { label: 'Custom Tool Configuration', icon: 'Sliders', category: 'developer', description: 'Create reusable custom modules.' }
    ]
  }
];

// Prebuilt demo graph structure representing a typical Lead classification pipeline
const initialNodes: Node<CustomNodeData>[] = [
  { id: 'node-1', type: 'custom', position: { x: 80, y: 165 }, data: { label: 'Webhook Trigger', icon: 'Zap', status: 'success', category: 'trigger', description: 'Trigger workflow when an external POST request is received.' } },
  { id: 'node-2', type: 'custom', position: { x: 420, y: 165 }, data: { label: 'Validate Request', icon: 'ShieldCheck', status: 'success', category: 'logic', description: 'Validate schema structure using strict JSON format rules.' } },
  { id: 'node-3', type: 'custom', position: { x: 760, y: 165 }, data: { label: 'AI Lead Classification', icon: 'Cpu', status: 'success', category: 'ai', description: 'Standard LLM categorization prompt block.' } },
  { id: 'node-4a', type: 'custom', position: { x: 1100, y: 50 }, data: { label: 'AI Agent Assessor', icon: 'Sparkles', status: 'idle', category: 'ai', description: 'Autonomous agent that selects tools to fulfill prompts.', config: { agentName: 'Enterprise Assessor', model: 'GPT-4o', temperature: 0.7, memory: 'session', tools: { database: true, search: true }, guardrails: { pii: true, injection: false }, instructions: 'Verify details of company size & target budget.' } } },
  { id: 'node-5a', type: 'custom', position: { x: 1440, y: 50 }, data: { label: 'Human Review Approval', icon: 'UserCheck', status: 'idle', category: 'logic', description: 'Pause execution for manual manager sign-off.', config: { approvalMessage: 'Review budget qualification details', assignee: 'Sarah Jenkins (Account Director)', timeout: 24 } } },
  { id: 'node-4b', type: 'custom', position: { x: 1100, y: 280 }, data: { label: 'CRM Lead Update (Salesforce)', icon: 'Database', status: 'idle', category: 'integration', description: 'Map variables to lead fields on Salesforce CRM.' } },
  { id: 'node-5b', type: 'custom', position: { x: 1440, y: 280 }, data: { label: 'Email Follow-up (Gmail)', icon: 'Mail', status: 'idle', category: 'integration', description: 'Dispatch HTML custom templates to client mailboxes.' } },
  { id: 'node-6', type: 'custom', position: { x: 1780, y: 165 }, data: { label: 'Merge Pathways', icon: 'Combine', status: 'idle', category: 'logic', description: 'Combine parallel routes into a single thread.' } },
  { id: 'node-7', type: 'custom', position: { x: 2120, y: 165 }, data: { label: 'Database Update (PostgreSQL)', icon: 'Database', status: 'idle', category: 'developer', description: 'Run database insert, update, or select transactions.' } },
  { id: 'node-8', type: 'custom', position: { x: 2460, y: 165 }, data: { label: 'Success Finish', icon: 'CheckCircle', status: 'idle', category: 'logic', description: 'Completion terminus endpoint.' } }
];

const initialEdges: Edge[] = [
  { id: 'edge-1-2', source: 'node-1', target: 'node-2', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'edge-2-3', source: 'node-2', target: 'node-3', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'edge-3-4a', source: 'node-3', target: 'node-4a', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'edge-3-4b', source: 'node-3', target: 'node-4b', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'edge-4a-5a', source: 'node-4a', target: 'node-5a', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'edge-4b-5b', source: 'node-4b', target: 'node-5b', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'edge-5a-6', source: 'node-5a', target: 'node-6', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'edge-5b-6', source: 'node-5b', target: 'node-6', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'edge-6-7', source: 'node-6', target: 'node-7', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'edge-7-8', source: 'node-7', target: 'node-8', sourceHandle: 'source-right', targetHandle: 'target-left', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
];

interface WorkflowBuilderProps {
  onBack: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onBack }) => {
  const { theme, showToast } = useBoardStore();
  
  const savedNodesStr = localStorage.getItem('tf-workflow-nodes');
  const initialNodesState = savedNodesStr ? JSON.parse(savedNodesStr) : initialNodes;

  const savedEdgesStr = localStorage.getItem('tf-workflow-edges');
  const initialEdgesState = savedEdgesStr ? JSON.parse(savedEdgesStr) : initialEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>(initialNodesState);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesState);
  
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);

  useEffect(() => {
    localStorage.setItem('tf-workflow-nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('tf-workflow-edges', JSON.stringify(edges));
  }, [edges]);
  
  // UI Panels states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [bottomDockCollapsed, setBottomDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'executions' | 'logs' | 'errors' | 'variables' | 'data'>('logs');

  // Search & Filter items
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});

  // Collaborative Cursors state
  const [ariaCursor, setAriaCursor] = useState({ x: 350, y: 120 });
  const [devonCursor, setDevonCursor] = useState({ x: 550, y: 220 });

  useEffect(() => {
    const interval = setInterval(() => {
      setAriaCursor((c) => ({
        x: Math.max(100, Math.min(1000, c.x + (Math.random() - 0.5) * 50)),
        y: Math.max(50, Math.min(450, c.y + (Math.random() - 0.5) * 50)),
      }));
      setDevonCursor((c) => ({
        x: Math.max(100, Math.min(1000, c.x + (Math.random() - 0.5) * 70)),
        y: Math.max(50, Math.min(450, c.y + (Math.random() - 0.5) * 70)),
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Node Name details
  const [workflowName, setWorkflowName] = useState('Google Stitch Lead Qualifying Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Published'>('Published');

  // Live Agent Sandbox simulation preview step
  const [aiPreviewStep, setAiPreviewStep] = useState(0);
  const aiSteps = [
    { desc: 'Loading payload contextual fields...', tool: 'Context Loader', result: 'budget=120000, company=Google' },
    { desc: 'Scanning database for existing match...', tool: 'Database Tool', result: 'Query success: 0 records found' },
    { desc: 'Fetching company size profile metadata...', tool: 'Clearbit API', result: '135,000 employees found' },
    { desc: 'Evaluating qualified metrics...', tool: 'Calculator Tool', result: 'Score = 1.0 (Qualified)' }
  ];

  // Variables picker modal helper
  const [activePickerField, setActivePickerField] = useState<string | null>(null);

  // Sync node changes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as Node<CustomNodeData>);
    },
    []
  );

  const updateSelectedNodeConfig = useCallback((key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                config: {
                  ...n.data.config,
                  [key]: value,
                },
              },
            }
          : n
      )
    );
    setSelectedNode((prev) =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              config: {
                ...prev.data.config,
                [key]: value,
              },
            },
          }
        : null
    );
  }, [selectedNode, setNodes]);

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    const newId = `node-${Date.now()}`;
    const newNode: Node<CustomNodeData> = {
      ...selectedNode,
      id: newId,
      position: {
        x: selectedNode.position.x + 80,
        y: selectedNode.position.y + 80,
      },
      selected: false,
    };
    setNodes((nds) => [...nds, newNode]);
    showToast(`Duplicated ${selectedNode.data.label}`);
    setSelectedNode(null);
  }, [selectedNode, setNodes, showToast]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    showToast(`Deleted ${selectedNode.data.label}`);
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges, showToast]);

  // Drag and drop setup
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    label: string,
    icon: string,
    category: string
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('text/label', label);
    event.dataTransfer.setData('text/icon', icon);
    event.dataTransfer.setData('text/category', category);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('text/label');
      const icon = event.dataTransfer.getData('text/icon');
      const category = event.dataTransfer.getData('text/category');

      if (!type) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 150,
      };

      const newNode: Node<CustomNodeData> = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: {
          label,
          icon,
          status: 'idle',
          category: category as any,
          description: `Custom ${label} parameters`,
          config: {}
        },
      };

      setNodes((nds) => nds.concat(newNode));
      showToast(`Added ${label}`);
    },
    [setNodes, showToast]
  );

  // Auto Layout arrange logic using a simple horizontal positioning sweep
  const handleAutoLayout = useCallback(() => {
    setNodes((nds) => {
      // Sort nodes in topological order based on standard prebuilt flow
      const orderedNodeIds = ['node-1', 'node-2', 'node-3', 'node-4a', 'node-4b', 'node-5a', 'node-5b', 'node-6', 'node-7', 'node-8'];
      let highBranchY = 50;
      let lowBranchY = 280;
      let standardY = 165;
      let currentX = 80;

      return nds.map((node) => {
        const orderIndex = orderedNodeIds.indexOf(node.id);
        if (orderIndex === -1) return node;

        let y = standardY;
        if (node.id === 'node-4a' || node.id === 'node-5a') {
          y = highBranchY;
          currentX = 1100 + (node.id === 'node-5a' ? 340 : 0);
        } else if (node.id === 'node-4b' || node.id === 'node-5b') {
          y = lowBranchY;
          currentX = 1100 + (node.id === 'node-5b' ? 340 : 0);
        } else {
          // Adjust X values sequentially
          if (node.id === 'node-1') currentX = 80;
          else if (node.id === 'node-2') currentX = 420;
          else if (node.id === 'node-3') currentX = 760;
          else if (node.id === 'node-6') currentX = 1780;
          else if (node.id === 'node-7') currentX = 2120;
          else if (node.id === 'node-8') currentX = 2460;
        }

        return {
          ...node,
          position: { x: currentX, y },
        };
      });
    });
    showToast('Auto arranged nodes layout');
  }, [setNodes, showToast]);

  // Filters Library Items based on search string
  const filteredLibrary = useMemo(() => {
    if (!searchQuery) return NODE_LIBRARY;
    const query = searchQuery.toLowerCase();
    return NODE_LIBRARY.map((cat) => {
      const items = cat.items.filter(
        (i) => i.label.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
      );
      return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const renderVariablePickerTree = (onSelect: (expr: string) => void) => {
    const vars = [
      {
        label: 'Webhook Trigger (trigger)',
        children: [
          { label: 'Event Type (trigger.event)', expr: '{{trigger.event}}' },
          {
            label: 'Customer details (trigger.customer)',
            children: [
              { label: 'Full Name (trigger.customer.name)', expr: '{{trigger.customer.name}}' },
              { label: 'Email Address (trigger.customer.email)', expr: '{{trigger.customer.email}}' },
              { label: 'Company Name (trigger.customer.company)', expr: '{{trigger.customer.company}}' },
              { label: 'Target Budget (trigger.customer.budget)', expr: '{{trigger.customer.budget}}' },
            ],
          },
        ],
      },
      {
        label: 'Lead Classification (nodes.ai_classification)',
        children: [
          { label: 'Priority Tier (nodes.ai_classification.output.priority)', expr: '{{nodes.ai_classification.output.priority}}' },
          { label: 'Confidence Score (nodes.ai_classification.output.confidence)', expr: '{{nodes.ai_classification.output.confidence}}' },
        ],
      },
    ];

    const renderTreeNodes = (nodesList: any[]): React.ReactNode => (
      <ul className="pl-3.5 space-y-1 mt-1">
        {nodesList.map((n) => (
          <li key={n.label} className="text-[10px]">
            {n.expr ? (
              <button
                onClick={() => onSelect(n.expr)}
                className="w-full text-left py-0.5 px-1.5 hover:bg-purple-600 hover:text-white rounded cursor-pointer transition-colors block truncate"
              >
                {n.label}
              </button>
            ) : (
              <div>
                <span className="text-text-secondary font-medium select-none">{n.label}</span>
                {n.children && renderTreeNodes(n.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );

    return (
      <div className="absolute right-0 top-6 w-56 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl z-50 p-2.5 max-h-56 overflow-y-auto animate-scale-up">
        <div className="text-[9.5px] font-bold text-text-heading border-b border-border-primary/50 pb-1 mb-1.5 flex items-center justify-between">
          <span>Variables Payload Tree</span>
          <button onClick={() => setActivePickerField(null)} className="text-rose-500 font-semibold cursor-pointer">✕</button>
        </div>
        {renderTreeNodes(vars)}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f1f3f4] dark:bg-[#151618] text-text-primary overflow-hidden transition-colors duration-200">
      
      {/* 1. TOP TOOLBAR */}
      <header className="h-14 bg-white dark:bg-[#202124] border-b border-border-primary flex items-center justify-between px-4 select-none shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            title="Back to workflows list"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="h-4 w-px bg-border-primary" />

          {/* Editable Workflow Name */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="bg-bg-tertiary border border-purple-500 rounded px-2 py-0.5 text-sm font-semibold text-text-heading outline-none w-56"
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-sm font-semibold text-text-heading hover:bg-bg-tertiary px-2 py-0.5 rounded cursor-pointer border border-transparent hover:border-border-primary/50 transition-all"
              >
                {workflowName}
              </h1>
            )}
            
            {/* Status toggle tag */}
            <button
              onClick={() => {
                setStatus(status === 'Draft' ? 'Published' : 'Draft');
                showToast(`Workflow state set to ${status === 'Draft' ? 'Published' : 'Draft'}`);
              }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer select-none transition-all ${
                status === 'Published'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              {status}
            </button>
          </div>
        </div>

        {/* Collaborators */}
        <div className="flex items-center gap-6">
          <div className="flex items-center -space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-[#202124]" title="Aria (PM)">A</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-[#202124]" title="Devon (Developer)">D</div>
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-[#202124]" title="You">Y</div>
            <div className="w-5 h-5 rounded-full bg-bg-tertiary flex items-center justify-center text-[9px] text-text-secondary border border-border-primary ml-1" title="3 Active Editors">
              <Users size={10} />
            </div>
          </div>

          <div className="h-4 w-px bg-border-primary" />

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => showToast('Changes saved')}
              className="p-1.5 hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              title="Save Changes"
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => showToast('Reverted last action')}
              className="p-1.5 hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={() => showToast('Redid last action')}
              className="p-1.5 hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
            
            <div className="h-4 w-px bg-border-primary mx-1" />

            <button
              onClick={() => {
                showToast('Starting workflow sandbox test...');
                setStatus('Published');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-all active:scale-95"
            >
              <Play size={13} className="fill-current" />
              <span>Test Flow</span>
            </button>

            <button
              onClick={() => showToast('Workflow is now actively running in production')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-all active:scale-95"
            >
              <Activity size={13} />
              <span>Activate</span>
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA (Left Sidebar + Canvas + Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 2. LEFT SIDEBAR — NODE LIBRARY */}
        <NodeLibrarySidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          collapsedCategories={collapsedCategories}
          setCollapsedCategories={setCollapsedCategories}
          filteredLibrary={filteredLibrary}
          leftSidebarCollapsed={leftSidebarCollapsed}
          setLeftSidebarCollapsed={setLeftSidebarCollapsed}
          onDragStart={onDragStart}
        />

        {/* 3. MAIN CANVAS */}
        <div
          className="flex-1 h-full relative overflow-hidden"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {leftSidebarCollapsed && (
            <button
              onClick={() => setLeftSidebarCollapsed(false)}
              className="absolute left-4 top-4 z-10 p-2 bg-white dark:bg-[#202124] border border-border-primary rounded-lg shadow-lg text-text-secondary hover:text-text-primary cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Expand Node Library"
            >
              <PanelLeftOpen size={16} />
              <span>Node Library</span>
            </button>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color={theme === 'dark' ? '#5f6368' : '#bcc0c4'} gap={16} size={1.2} />
            <Controls className="bg-white dark:bg-[#202124] border border-border-primary rounded-lg shadow-lg [&>button]:border-border-primary [&>button]:text-text-secondary" />
            <MiniMap
                style={{
                  height: 100,
                  width: 150,
                  background: theme === 'dark' ? '#202124' : '#ffffff',
                  borderColor: theme === 'dark' ? '#3c4043' : '#dadce0',
                }}
                nodeColor={(n) => {
                  if (n.data.category === 'trigger') return '#f59e0b';
                  if (n.data.category === 'logic') return '#3b82f6';
                  if (n.data.category === 'ai') return '#a855f7';
                  if (n.data.category === 'integration') return '#10b981';
                  return '#64748b';
                }}
                maskColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)'}
                className="border rounded-lg shadow-md !m-4"
              />
            <style>{`
              .react-flow__controls-button {
                background-color: var(--color-bg-secondary, #ffffff) !important;
                border-color: var(--color-border-primary, #dadce0) !important;
                color: var(--color-text-secondary, #5f6368) !important;
                fill: currentColor !important;
              }
              .dark .react-flow__controls-button {
                background-color: #202124 !important;
                border-color: #3c4043 !important;
                color: #e8eaed !important;
              }
            `}</style>

            <Panel position="top-right" className="flex items-center gap-1.5 bg-white/95 dark:bg-[#202124]/95 backdrop-blur px-2.5 py-1.5 border border-border-primary rounded-lg shadow-md">
              <button
                onClick={handleAutoLayout}
                className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-[10px] font-semibold flex items-center gap-1"
                title="Auto Arrange Nodes"
              >
                <Layers size={11} />
                <span>Auto Layout</span>
              </button>
            </Panel>
          </ReactFlow>

          {/* Collaborative cursors overlays */}
          <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
            {/* Aria's Cursor */}
            <div
              className="absolute transition-all duration-[1500ms] ease-out flex flex-col items-start gap-1"
              style={{ left: ariaCursor.x, top: ariaCursor.y }}
            >
              <MousePointer size={14} className="text-rose-500 fill-rose-500 rotate-90" />
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md font-bold select-none whitespace-nowrap">
                Aria (PM)
              </span>
            </div>

            {/* Devon's Cursor */}
            <div
              className="absolute transition-all duration-[1500ms] ease-out flex flex-col items-start gap-1"
              style={{ left: devonCursor.x, top: devonCursor.y }}
            >
              <MousePointer size={14} className="text-blue-500 fill-blue-500 rotate-90" />
              <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md font-bold select-none whitespace-nowrap">
                Devon (Dev)
              </span>
            </div>
          </div>
        </div>

        {/* 4. RIGHT CONFIGURATION PANEL */}
        {selectedNode && (
          <NodeSettingsPanel
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            setNodes={setNodes}
            showToast={showToast}
            activePickerField={activePickerField}
            setActivePickerField={setActivePickerField}
            updateSelectedNodeConfig={updateSelectedNodeConfig}
            duplicateSelectedNode={duplicateSelectedNode}
            deleteSelectedNode={deleteSelectedNode}
            aiPreviewStep={aiPreviewStep}
            setAiPreviewStep={setAiPreviewStep}
            aiSteps={aiSteps}
            renderVariablePickerTree={renderVariablePickerTree}
          />
        )}
      </div>

      {/* 5. BOTTOM DEBUGGER PANEL */}
      <DebugPanel
        bottomDockCollapsed={bottomDockCollapsed}
        setBottomDockCollapsed={setBottomDockCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};
