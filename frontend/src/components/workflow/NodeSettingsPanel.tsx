import React from 'react';
import type { Node } from '@xyflow/react';
import type { CustomNodeData } from './CustomNode';
import {
  Cpu,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Link2,
  User,
  Activity,
  CheckCircle,
  Layers,
  Terminal
} from 'lucide-react';

interface NodeSettingsPanelProps {
  selectedNode: Node<CustomNodeData>;
  setSelectedNode: (node: Node<CustomNodeData> | null) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node<CustomNodeData>[]>>;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  activePickerField: string | null;
  setActivePickerField: (field: string | null) => void;
  updateSelectedNodeConfig: (key: string, value: any) => void;
  duplicateSelectedNode: () => void;
  deleteSelectedNode: () => void;
  aiPreviewStep: number;
  setAiPreviewStep: React.Dispatch<React.SetStateAction<number>>;
  aiSteps: { desc: string; tool: string; result: string }[];
  renderVariablePickerTree: (onSelect: (expr: string) => void) => React.ReactNode;
}

export const NodeSettingsPanel: React.FC<NodeSettingsPanelProps> = ({
  selectedNode,
  setSelectedNode,
  setNodes,
  showToast,
  activePickerField,
  setActivePickerField,
  updateSelectedNodeConfig,
  duplicateSelectedNode,
  deleteSelectedNode,
  aiPreviewStep,
  setAiPreviewStep,
  aiSteps,
  renderVariablePickerTree,
}) => {
  return (
    <aside className="w-80 border-l border-border-primary bg-white dark:bg-[#202124] flex flex-col shrink-0 overflow-y-auto select-none transition-colors duration-200">
      <div className="p-3.5 border-b border-border-primary flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Cpu size={14} />
          </span>
          <span className="text-xs font-bold text-text-heading truncate max-w-[180px]">
            {selectedNode.data.label}
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 hover:bg-bg-tertiary rounded-lg text-text-secondary cursor-pointer text-sm font-semibold"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4 text-xs overflow-y-auto">
        {/* Node Description */}
        <div>
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
            Node Description
          </label>
          <textarea
            value={selectedNode.data.description || ''}
            onChange={(e) => {
              const desc = e.target.value;
              setNodes((nds) =>
                nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, description: desc } } : n))
              );
              setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, description: desc } });
            }}
            className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-purple-500"
            rows={2}
          />
        </div>

        {/* 1. Webhook Trigger */}
        {selectedNode.data.label.includes('Webhook') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <Activity size={13} />
              <span>Webhook Trigger Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Webhook URL</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  readOnly
                  value="https://api.trackflow.io/v1/webhooks/lead-ingest"
                  className="flex-grow bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-[10.5px] font-mono text-text-secondary outline-none"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText("https://api.trackflow.io/v1/webhooks/lead-ingest"); showToast("URL copied!"); }}
                  className="px-2 py-1 bg-bg-tertiary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border-primary rounded-lg font-semibold cursor-pointer text-[10px]"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">HTTP Method</label>
              <select className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Secret Key / Signature Auth</label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* 2. Validate Request */}
        {selectedNode.data.label.includes('Validate') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <CheckCircle size={13} />
              <span>Schema Validation Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Validation Engine</label>
              <select className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="json-schema">JSON Schema Validator</option>
                <option value="javascript">Custom JS Function</option>
                <option value="regex">Regex Field Pattern Matcher</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">JSON Schema Definition</label>
              <textarea
                rows={6}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-[10px] font-mono text-text-primary outline-none focus:border-purple-500"
                value={JSON.stringify({
                  type: "object",
                  required: ["customer"],
                  properties: {
                    customer: {
                      type: "object",
                      required: ["name", "email", "company", "budget"],
                      properties: {
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        company: { type: "string" },
                        budget: { type: "number" }
                      }
                    }
                  }
                }, null, 2)}
                readOnly
              />
            </div>
          </div>
        )}

        {/* 3. AI Lead Classification */}
        {selectedNode.data.label.includes('Classification') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>AI Lead Classifier Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Classification Prompt</label>
              <textarea
                rows={3}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
                defaultValue="Classify incoming request into high value or low value based on company domain and budget: High if budget > 50,000 and domain is enterprise."
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Model Selection</label>
              <select className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="gpt-4o">GPT-4o (Standard)</option>
                <option value="claude-3-5">Claude 3.5 Sonnet</option>
                <option value="gemini-1-5">Gemini 1.5 Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Confidence Threshold</label>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.8" className="w-full accent-purple-600 cursor-pointer" />
            </div>
          </div>
        )}

        {/* 4. CRM Lead Update */}
        {selectedNode.data.label.includes('CRM') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <Link2 size={13} />
              <span>Salesforce CRM Connection Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Account Connection</label>
              <select className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="salesforce-prod">Salesforce Production - TrackFlow App</option>
                <option value="salesforce-sandbox">Salesforce Sandbox - Dev</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Salesforce Action</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="upsert">Upsert Lead Record</option>
                <option value="create">Create New Lead</option>
                <option value="update">Update Field Values</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">CRM Field Mappings</label>
              <div className="space-y-1.5">
                <div className="flex gap-2 items-center">
                  <span className="w-20 font-mono text-[10px]">Company:</span>
                  <input type="text" readOnly value="{{trigger.customer.company}}" className="flex-grow bg-bg-tertiary border border-border-primary rounded-lg px-2 py-0.5 text-[10.5px] font-mono text-text-secondary" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-20 font-mono text-[10px]">Email:</span>
                  <input type="text" readOnly value="{{trigger.customer.email}}" className="flex-grow bg-bg-tertiary border border-border-primary rounded-lg px-2 py-0.5 text-[10.5px] font-mono text-text-secondary" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-20 font-mono text-[10px]">Status:</span>
                  <input type="text" readOnly value="Nurturing" className="flex-grow bg-bg-tertiary border border-border-primary rounded-lg px-2 py-0.5 text-[10.5px] font-mono text-text-secondary" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Email Follow-up */}
        {selectedNode.data.label.includes('Email') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <Link2 size={13} />
              <span>Gmail Follow-up Dispatcher Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">To Address</label>
              <input type="text" readOnly value="{{trigger.customer.email}}" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-[10.5px] font-mono text-text-secondary" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Subject</label>
              <input type="text" readOnly value="Welcome to TrackFlows, {{trigger.customer.name}}!" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-[10.5px] font-mono text-text-secondary" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Email Body template (HTML)</label>
              <textarea
                rows={4}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-[10.5px] font-mono text-text-primary outline-none"
                value="Hello {{trigger.customer.name}},\n\nThank you for choosing TrackFlows. We've matched your profile and will follow up shortly.\n\nBest,\nTrackFlows Team"
                readOnly
              />
            </div>
          </div>
        )}

        {/* 6. Merge Pathways */}
        {selectedNode.data.label.includes('Merge') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Merge Pathways Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Merge Strategy</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="wait-all">Wait for all parallel branches to resolve</option>
                <option value="wait-first">Race: Proceed on first resolved branch output</option>
                <option value="union">Union Join payloads into single array</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Required Input Handles</label>
              <div className="text-[10px] space-y-1 text-text-secondary font-mono">
                <div>- target-1: High Value Branch</div>
                <div>- target-2: Low Value Branch</div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Database Update */}
        {selectedNode.data.label.includes('Database') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <Link2 size={13} />
              <span>PostgreSQL Database Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Database Instance</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500">
                <option value="postgres-main">Postgres Prod (Main Lead DB)</option>
                <option value="postgres-replica">Postgres Replica</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">SQL Query</label>
              <textarea
                rows={5}
                className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2.5 py-1 text-[10px] font-mono text-text-primary outline-none focus:border-purple-500"
                value="INSERT INTO lead_pipeline (company, revenue, priority, created_at) VALUES (\n  '{{trigger.customer.company}}',\n  {{trigger.customer.budget}},\n  '{{nodes.ai_classification.output.priority}}',\n  NOW()\n);"
                readOnly
              />
            </div>
            <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer mt-1">
              <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5" />
              <span>Run within transaction block</span>
            </label>
          </div>
        )}

        {/* 8. Success Finish */}
        {selectedNode.data.label.includes('Success') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle size={13} />
              <span>Success Terminus Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Final Log Output</label>
              <input type="text" readOnly value="Workflow run #{{run.id}} executed successfully in {{run.duration}}ms." className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-[10.5px] font-mono text-text-secondary" />
            </div>
            <div className="space-y-2 border-t border-border-primary/40 pt-3">
              <label className="block text-[10px] font-semibold text-text-secondary">Completion Webhook Alerts</label>
              <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5" />
                <span>Post run details to Slack (#ops-alerts)</span>
              </label>
              <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
                <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5" />
                <span>Post run details to Discord Webhook</span>
              </label>
            </div>
          </div>
        )}

        {/* AI Agent Configuration */}
        {selectedNode.data.category === 'ai' && selectedNode.data.label.includes('Agent') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4">
            <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>AI Agent Settings</span>
            </h3>

            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Agent Name</label>
              <input
                type="text"
                value={selectedNode.data.config?.agentName || ''}
                onChange={(e) => updateSelectedNodeConfig('agentName', e.target.value)}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-purple-500"
              />
            </div>

            {/* System Instructions with Expression Builder */}
            <div className="relative">
              <label className="block text-[10px] font-semibold text-text-secondary mb-1 flex items-center justify-between">
                <span>System Instructions</span>
                <button
                  onClick={() => setActivePickerField(activePickerField === 'instructions' ? null : 'instructions')}
                  className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Plus size={10} /> Add Variable
                </button>
              </label>
              <textarea
                value={selectedNode.data.config?.instructions || ''}
                onChange={(e) => updateSelectedNodeConfig('instructions', e.target.value)}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-purple-500"
                rows={3}
                placeholder="e.g. You are a sales assistant. Dynamic details: {{trigger.customer.company}}"
              />
              {activePickerField === 'instructions' &&
                renderVariablePickerTree((expr) => {
                  const current = selectedNode.data.config?.instructions || '';
                  updateSelectedNodeConfig('instructions', current + expr);
                  setActivePickerField(null);
                })}
            </div>

            {/* Model & Temp Slider */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">LLM Model</label>
                <select
                  value={selectedNode.data.config?.model || 'GPT-4o'}
                  onChange={(e) => updateSelectedNodeConfig('model', e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
                >
                  <option value="GPT-4o">GPT-4o</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Temperature ({selectedNode.data.config?.temperature ?? 0.7})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedNode.data.config?.temperature ?? 0.7}
                  onChange={(e) => updateSelectedNodeConfig('temperature', parseFloat(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Agent Tools */}
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1.5">Agent Tools</label>
              <div className="space-y-1">
                {['Database', 'Search', 'HTTP API', 'Calculator'].map((tool) => (
                  <label key={tool} className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedNode.data.config?.tools?.[tool.toLowerCase()]}
                      onChange={(e) => {
                        const currentTools = selectedNode.data.config?.tools || {};
                        updateSelectedNodeConfig('tools', {
                          ...currentTools,
                          [tool.toLowerCase()]: e.target.checked,
                        });
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>{tool}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Memory Type */}
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Memory Mode</label>
              <select
                value={selectedNode.data.config?.memory || 'session'}
                onChange={(e) => updateSelectedNodeConfig('memory', e.target.value)}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
              >
                <option value="session">Session Memory</option>
                <option value="workflow">Workflow Memory</option>
                <option value="vector">Vector Memory</option>
              </select>
            </div>

            {/* Agent Guardrails */}
            <div className="space-y-2 border-t border-border-primary/40 pt-3">
              <label className="block text-[10px] font-semibold text-text-secondary">Guardrails & Safety</label>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedNode.data.config?.guardrails?.pii}
                    onChange={(e) => {
                      const currentGuard = selectedNode.data.config?.guardrails || {};
                      updateSelectedNodeConfig('guardrails', { ...currentGuard, pii: e.target.checked });
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500 w-3 h-3"
                  />
                  <span>PII Protection</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedNode.data.config?.guardrails?.injection}
                    onChange={(e) => {
                      const currentGuard = selectedNode.data.config?.guardrails || {};
                      updateSelectedNodeConfig('guardrails', { ...currentGuard, injection: e.target.checked });
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500 w-3 h-3"
                  />
                  <span>Injection Detect</span>
                </label>
              </div>
            </div>

            {/* Live execution preview tester */}
            <div className="bg-[#f8f9fa] dark:bg-[#282a2d] border border-border-primary rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-heading flex items-center gap-1">
                  <Terminal size={11} className="text-purple-500 animate-pulse" />
                  <span>Live Agent Sandbox</span>
                </span>
                <button
                  onClick={() => setAiPreviewStep((s) => (s + 1) % aiSteps.length)}
                  className="text-[9px] bg-purple-600 hover:bg-purple-700 text-white px-2 py-0.5 rounded cursor-pointer"
                >
                  Step Next
                </button>
              </div>
              <div className="text-[10.5px] leading-relaxed text-text-secondary bg-white dark:bg-[#1e1f22] p-2 rounded font-mono border border-border-primary/30 max-h-36 overflow-y-auto space-y-1.5">
                <div className="text-purple-600 dark:text-purple-400 font-semibold">{aiSteps[aiPreviewStep].desc}</div>
                <div>
                  Tool Selected: <strong className="text-text-primary">{aiSteps[aiPreviewStep].tool}</strong>
                </div>
                <div>
                  Result: <span className="text-emerald-600 dark:text-emerald-400">{aiSteps[aiPreviewStep].result}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HTTP Request Configuration */}
        {selectedNode.data.category === 'developer' && selectedNode.data.label.includes('HTTP') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4">
            <h3 className="text-xs font-bold text-blue-500 dark:text-blue-400 flex items-center gap-1.5">
              <Link2 size={13} />
              <span>HTTP Request Configuration</span>
            </h3>

            {/* Tabs parameters */}
            <div className="flex gap-2">
              <div className="w-1/3">
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Method</label>
                <select
                  value={selectedNode.data.config?.method || 'POST'}
                  onChange={(e) => updateSelectedNodeConfig('method', e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-1.5 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              
              <div className="w-2/3 relative">
                <label className="block text-[10px] font-semibold text-text-secondary mb-1 flex items-center justify-between">
                  <span>URL</span>
                  <button
                    onClick={() => setActivePickerField(activePickerField === 'url' ? null : 'url')}
                    className="text-[9px] text-purple-600 hover:underline cursor-pointer"
                  >
                    + Variable
                  </button>
                </label>
                <input
                  type="text"
                  value={selectedNode.data.config?.url || 'https://api.example.com'}
                  onChange={(e) => updateSelectedNodeConfig('url', e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
                />
                {activePickerField === 'url' &&
                  renderVariablePickerTree((expr) => {
                    const current = selectedNode.data.config?.url || '';
                    updateSelectedNodeConfig('url', current + expr);
                    setActivePickerField(null);
                  })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Headers (JSON)</label>
              <textarea
                placeholder='{ "Content-Type": "application/json" }'
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs font-mono text-text-primary outline-none focus:border-purple-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Body Template</label>
              <textarea
                value={selectedNode.data.config?.body || '{\n  "lead": "{{trigger.customer.email}}"\n}'}
                onChange={(e) => updateSelectedNodeConfig('body', e.target.value)}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs font-mono text-text-primary outline-none focus:border-purple-500"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Human Approval Node */}
        {selectedNode.data.label.includes('Human') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4">
            <h3 className="text-xs font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <User size={13} />
              <span>Human Approval Config</span>
            </h3>

            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Approval Message</label>
              <input
                type="text"
                value={selectedNode.data.config?.approvalMessage || ''}
                onChange={(e) => updateSelectedNodeConfig('approvalMessage', e.target.value)}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Assignee</label>
              <select
                value={selectedNode.data.config?.assignee || 'Sarah Jenkins'}
                onChange={(e) => updateSelectedNodeConfig('assignee', e.target.value)}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-purple-500"
              >
                <option value="Sarah Jenkins (Account Director)">Sarah Jenkins (Account Director)</option>
                <option value="Marcus Aurelius (Lead Architect)">Marcus Aurelius (Lead Architect)</option>
                <option value="Admin Queue (Auto-assigned)">Admin Queue (Auto-assigned)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Escalation Timeout (hours)</label>
              <input
                type="number"
                value={selectedNode.data.config?.timeout || 24}
                onChange={(e) => updateSelectedNodeConfig('timeout', parseInt(e.target.value))}
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}
        {/* Fallback Config Panels for other library nodes */}
        {/* A. Cron / Schedule Triggers */}
        {(selectedNode.data.label.includes('Schedule') || selectedNode.data.label.includes('Cron')) && !selectedNode.data.label.includes('Webhook') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <Activity size={13} />
              <span>Cron & Schedule Timer Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Schedule Interval</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                <option value="5-min">Every 5 Minutes</option>
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily at Midnight</option>
                <option value="cron">Custom Cron Expression</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Cron Expression</label>
              <input type="text" defaultValue="*/5 * * * *" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Timezone</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                <option value="utc">UTC (Coordinated Universal Time)</option>
                <option value="est">EST (Eastern Standard Time)</option>
                <option value="pst">PST (Pacific Standard Time)</option>
              </select>
            </div>
          </div>
        )}

        {/* B. Database / Email / API Event Triggers */}
        {(selectedNode.data.label.includes('Email Trigger') || selectedNode.data.label.includes('Database Trigger') || selectedNode.data.label.includes('API Event')) && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <Activity size={13} />
              <span>Event Listener Settings</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Connection Resource</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                <option value="resource-1">Gmail Account Inbox</option>
                <option value="resource-2">Postgres Production replica</option>
                <option value="resource-3">Custom webhook source</option>
              </select>
            </div>
            {selectedNode.data.label.includes('Database') ? (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Target Table & Event Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="e.g. users" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none" />
                  <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                    <option value="insert">ON INSERT</option>
                    <option value="update">ON UPDATE</option>
                    <option value="delete">ON DELETE</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Filter Query Expression</label>
                <input type="text" placeholder="e.g. from:manager@company.com" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" />
              </div>
            )}
          </div>
        )}

        {/* C. If/Else & Switch Branches */}
        {(selectedNode.data.label.includes('If / Else') || selectedNode.data.label.includes('Switch')) && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Branching Rules Logic</span>
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2 items-center text-[10px] font-bold text-text-secondary">
                <span className="w-1/3">Field Variable</span>
                <span className="w-1/3">Operator</span>
                <span className="w-1/3">Match Value</span>
              </div>
              <div className="flex gap-1.5">
                <input type="text" defaultValue="{{trigger.customer.budget}}" className="w-1/3 bg-bg-tertiary border border-border-primary rounded px-1.5 py-1 text-[10px] font-mono text-text-primary outline-none" />
                <select className="w-1/3 bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded px-1 text-[10px] text-text-primary outline-none">
                  <option value="gt">Greater Than (&gt;)</option>
                  <option value="lt">Less Than (&lt;)</option>
                  <option value="eq">Equals (=)</option>
                  <option value="contains">Contains</option>
                </select>
                <input type="text" defaultValue="50000" className="w-1/3 bg-bg-tertiary border border-border-primary rounded px-1.5 py-1 text-[10px] text-text-primary outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* D. Delay / Filter / Retry / Error Handler */}
        {(selectedNode.data.label.includes('Filter') || selectedNode.data.label.includes('Delay') || selectedNode.data.label.includes('Retry') || selectedNode.data.label.includes('Error')) && !selectedNode.data.label.includes('Validate') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Logic Controller Parameters</span>
            </h3>
            {selectedNode.data.label.includes('Delay') ? (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Delay duration</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" defaultValue="5" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" />
                  <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>
            ) : selectedNode.data.label.includes('Retry') ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Max Retries</label>
                  <input type="number" defaultValue="3" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Backoff Mode</label>
                  <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                    <option value="exponential">Exponential</option>
                    <option value="fixed">Fixed Delay</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Conditional Match rule</label>
                <input type="text" placeholder="e.g. {{nodes.ai_classifier.output.confidence}} >= 0.8" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
              </div>
            )}
          </div>
        )}

        {/* E. Loop / Parallel Branch */}
        {(selectedNode.data.label.includes('Loop') || selectedNode.data.label.includes('Parallel')) && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Multi-Execution Block</span>
            </h3>
            {selectedNode.data.label.includes('Loop') ? (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Loop Array Source</label>
                <input type="text" defaultValue="{{trigger.customer.items}}" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Parallel Branches execution count</label>
                <input type="number" defaultValue="2" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" />
              </div>
            )}
          </div>
        )}

        {/* F. LLM Prompt / Summarizer / Content Generator / Embeddings / RAG */}
        {(selectedNode.data.label.includes('LLM') || selectedNode.data.label.includes('Summarizer') || selectedNode.data.label.includes('Generator') || selectedNode.data.label.includes('Embeddings') || selectedNode.data.label.includes('RAG')) && !selectedNode.data.label.includes('Classification') && !selectedNode.data.label.includes('Agent') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>AI Block Configuration</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Model Profile</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                <option value="gpt-4o">GPT-4o (Standard)</option>
                <option value="claude-3-5">Claude 3.5 Sonnet</option>
              </select>
            </div>
            {selectedNode.data.label.includes('Embeddings') ? (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Text Vector Input</label>
                <input type="text" defaultValue="{{trigger.customer.description}}" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
              </div>
            ) : selectedNode.data.label.includes('RAG') ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Vector Store Index</label>
                  <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                    <option value="kb-products">Products Knowledgebase</option>
                    <option value="kb-faq">Customer Support FAQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Search Query Source</label>
                  <input type="text" defaultValue="{{trigger.customer.name}}" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Instructions / Prompt Template</label>
                <textarea rows={4} className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" defaultValue="Write a summary details for company: {{trigger.customer.company}}" />
              </div>
            )}
          </div>
        )}

        {/* G. Slack / Discord / Notifications */}
        {(selectedNode.data.label.includes('Slack') || selectedNode.data.label.includes('Discord')) && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <Link2 size={13} />
              <span>Instant Alert Configuration</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Webhook URL</label>
              <input type="text" placeholder="https://hooks.slack.com/services/T00000000/B00000000/your-webhook-token" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Message Payload Template</label>
              <textarea rows={3} className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" defaultValue="Lead notification alert: {{trigger.customer.name}} from {{trigger.customer.company}}." />
            </div>
          </div>
        )}

        {/* H. OpenAI / Anthropic / HubSpot / Sheets / Google / AWS / GitHub Connections */}
        {(selectedNode.data.label.includes('OpenAI') || selectedNode.data.label.includes('Anthropic') || selectedNode.data.label.includes('HubSpot') || selectedNode.data.label.includes('Sheets') || selectedNode.data.label.includes('AWS') || selectedNode.data.label.includes('GitHub')) && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <Link2 size={13} />
              <span>Third-party OAuth Connection</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Authorized Profile</label>
              <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                <option value="profile-main">Main Corporate Account</option>
                <option value="profile-dev">Developer Test Profile</option>
              </select>
            </div>
            {selectedNode.data.label.includes('Sheets') ? (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Spreadsheet Target Link</label>
                <input type="text" defaultValue="https://docs.google.com/spreadsheets/d/1XyZ..." className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" />
              </div>
            ) : selectedNode.data.label.includes('GitHub') ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Repository</label>
                  <input type="text" defaultValue="org/repo" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Workflow File</label>
                  <input type="text" defaultValue="deploy.yml" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary mb-1">Action Method</label>
                <input type="text" defaultValue="chat.completions" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono outline-none" />
              </div>
            )}
          </div>
        )}

        {/* I. JavaScript / Python Code Run */}
        {(selectedNode.data.label.includes('JavaScript') || selectedNode.data.label.includes('Python')) && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Terminal size={13} />
              <span>Sandbox Script Execution</span>
            </h3>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary mb-1">Sandbox Script Code</label>
              <textarea
                rows={6}
                className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2.5 py-1 text-[10px] font-mono text-text-primary outline-none focus:border-purple-500"
                defaultValue={selectedNode.data.label.includes('Java') ? "// Access incoming variables via payload object\nconst budget = payload.trigger.customer.budget;\n\nif (budget > 100000) {\n  return { tier: 'vip' };\n} else {\n  return { tier: 'standard' };\n}" : "# Python runtime script execution\nbudget = payload['trigger']['customer']['budget']\n\nif budget > 100000:\n    return {'tier': 'vip'}\nelse:\n    return {'tier': 'standard'}"}
              />
            </div>
          </div>
        )}

        {/* J. SQL / GraphQL / REST API Queries */}
        {(selectedNode.data.label.includes('SQL') || selectedNode.data.label.includes('GraphQL') || selectedNode.data.label.includes('REST') || selectedNode.data.label.includes('GraphQL') || selectedNode.data.label.includes('MySQL') || selectedNode.data.label.includes('MongoDB') || selectedNode.data.label.includes('Custom Tool')) && !selectedNode.data.label.includes('HTTP') && !selectedNode.data.label.includes('Database Update') && (
          <div className="space-y-4 border-t border-border-primary/50 pt-4 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Terminal size={13} />
              <span>Developer API & Query Settings</span>
            </h3>
            {selectedNode.data.label.includes('REST') || selectedNode.data.label.includes('GraphQL') ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">API Endpoint</label>
                  <input type="text" defaultValue="https://api.external.com/v1/graphql" className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Query Document</label>
                  <textarea rows={4} className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2.5 py-1 text-[10.5px] font-mono text-text-primary outline-none" defaultValue={selectedNode.data.label.includes('GraphQL') ? "query GetProduct($id: ID!) {\n  product(id: $id) {\n    title\n    price\n  }\n}" : "{\n  \"action\": \"fetch_profile\"\n}"} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Connection Pool Select</label>
                  <select className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2 py-1 text-xs text-text-primary outline-none">
                    <option value="db-1">MySQL Production Database</option>
                    <option value="db-2">MongoDB Logger Database</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary mb-1">Execution Query statement</label>
                  <textarea rows={4} className="w-full bg-[#f1f3f4] dark:bg-[#202124] border border-border-primary rounded-lg px-2.5 py-1 text-[10.5px] font-mono text-text-primary outline-none" defaultValue={selectedNode.data.label.includes('Mongo') ? "db.leads.insertOne({\n  \"name\": \"{{trigger.customer.name}}\"\n});" : "SELECT * FROM users WHERE email = '{{trigger.customer.email}}';"} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Node actions */}
        <div className="border-t border-border-primary/50 pt-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                showToast(`Node ${selectedNode.data.label} sandbox step run successfully!`);
              }}
              className="flex-1 py-1.5 px-3 bg-bg-tertiary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border-primary rounded-lg font-semibold text-center transition-colors cursor-pointer"
            >
              Test Step
            </button>
            
            <button
              onClick={() => {
                showToast('Config saved successfully');
                setSelectedNode(null);
              }}
              className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition-colors cursor-pointer"
            >
              Save Config
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={duplicateSelectedNode}
              className="flex-grow py-1.5 bg-transparent hover:bg-bg-tertiary border border-border-primary/70 text-text-secondary rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy size={12} />
              <span>Duplicate</span>
            </button>
            <button
              onClick={deleteSelectedNode}
              className="flex-grow py-1.5 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 border border-rose-500/20 text-rose-400 rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Delete Node</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
