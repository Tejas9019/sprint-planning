import React from 'react';
import {
  History,
  Terminal,
  ShieldAlert,
  Sliders,
  FileJson,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DebugPanelProps {
  bottomDockCollapsed: boolean;
  setBottomDockCollapsed: (collapsed: boolean) => void;
  activeTab: 'executions' | 'logs' | 'errors' | 'variables' | 'data';
  setActiveTab: (tab: 'executions' | 'logs' | 'errors' | 'variables' | 'data') => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  bottomDockCollapsed,
  setBottomDockCollapsed,
  activeTab,
  setActiveTab,
}) => {
  return (
    <footer className={`border-t border-border-primary bg-white dark:bg-[#202124] flex flex-col shrink-0 transition-all duration-200 ${
      bottomDockCollapsed ? 'h-9' : 'h-48'
    }`}>
      
      {/* Debug panel tabs */}
      <div className="h-9 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 select-none shrink-0">
        <div className="flex items-center gap-1">
          {(['executions', 'logs', 'errors', 'variables', 'data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (bottomDockCollapsed) setBottomDockCollapsed(false);
              }}
              className={`h-9 px-3 text-xs font-semibold border-b-2 flex items-center capitalize transition-all cursor-pointer ${
                activeTab === tab && !bottomDockCollapsed
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#202124]'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'executions' && <History size={11} className="mr-1.5" />}
              {tab === 'logs' && <Terminal size={11} className="mr-1.5" />}
              {tab === 'errors' && <ShieldAlert size={11} className="mr-1.5" />}
              {tab === 'variables' && <Sliders size={11} className="mr-1.5" />}
              {tab === 'data' && <FileJson size={11} className="mr-1.5" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-text-secondary font-mono">
          <span>Connected Sandbox: <span className="text-purple-500 font-semibold">tf-active-901</span></span>
          <button
            onClick={() => setBottomDockCollapsed(!bottomDockCollapsed)}
            className="p-1 hover:bg-bg-tertiary rounded text-text-secondary hover:text-text-primary cursor-pointer transition-colors flex items-center justify-center"
            title={bottomDockCollapsed ? "Expand Panel" : "Collapse Panel"}
          >
            {bottomDockCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Debug panel content */}
      {!bottomDockCollapsed && (
        <div className="flex-grow p-3 overflow-y-auto font-mono text-[11px] leading-relaxed bg-white dark:bg-[#1e1f22]">
          
          {activeTab === 'logs' && (
            <div className="space-y-1.5 text-text-secondary">
              <div className="flex gap-4">
                <span className="text-[#3c4043] dark:text-[#9aa0a6]">[10:45:01]</span>
                <span className="text-emerald-500 font-bold">[INFO]</span>
                <span>Inbound webhook trigger fired successfully. IP source resolved.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#3c4043] dark:text-[#9aa0a6]">[10:45:02]</span>
                <span className="text-emerald-500 font-bold">[INFO]</span>
                <span>JSON payload validation pass: 0 errors detected. Processing fields...</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#3c4043] dark:text-[#9aa0a6]">[10:45:03]</span>
                <span className="text-purple-500 font-bold">[LLM]</span>
                <span>AI Lead Classification: prompt input token length: 3,420, temp setting: 0.2.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#3c4043] dark:text-[#9aa0a6]">[10:45:04]</span>
                <span className="text-purple-500 font-bold">[LLM]</span>
                <span>Classification Output: {"{ \"tier\": \"high\", \"confidence\": 0.96 }"}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#3c4043] dark:text-[#9aa0a6]">[10:45:05]</span>
                <span className="text-blue-500 font-bold">[AGENT]</span>
                <span>Agent Assessor initialized: calling PostgreSQL tool node.</span>
              </div>
            </div>
          )}

          {activeTab === 'executions' && (
            <div className="space-y-1.5 text-text-secondary">
              <div className="flex items-center justify-between p-1.5 hover:bg-bg-tertiary rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span className="font-semibold text-text-heading">Run #142 (Webhook Trigger)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Completed: 10:45:06</span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-0.5 px-2 rounded-full font-bold">Success (1.92s)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-1.5 hover:bg-bg-tertiary rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span className="font-semibold text-text-heading">Run #141 (Webhook Trigger)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Completed: 10:40:12</span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-0.5 px-2 rounded-full font-bold">Success (1.81s)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-1.5 hover:bg-bg-tertiary rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <XCircle size={12} className="text-rose-500" />
                  <span className="font-semibold text-text-heading">Run #140 (Manual Trigger)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Completed: 10:32:00</span>
                  <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 py-0.5 px-2 rounded-full font-bold">Failed (Code: HTTP_500)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="text-text-secondary space-y-2 p-1">
              <div className="flex gap-3 bg-rose-500/5 border border-rose-500/15 p-2.5 rounded-lg text-rose-600 dark:text-rose-400">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Execution Warning: Target node #5a (Human Approval) timed out.</div>
                  <div className="text-[10px] mt-0.5">Approval deadline exceeded 24h limits. Triggered escalation path backup logic automatically.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="grid grid-cols-2 gap-4 text-text-secondary">
              <div>
                <div className="font-semibold text-text-heading mb-1.5">Runtime Workflow variables</div>
                <div className="space-y-1">
                  <div>workflow.id: <strong className="text-text-primary">"lead-ingest-v2"</strong></div>
                  <div>workflow.creator: <strong className="text-text-primary">"Sarah Jenkins"</strong></div>
                  <div>workflow.runs: <strong className="text-text-primary">142</strong></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-text-heading mb-1.5">Secrets & Environment Context</div>
                <div className="space-y-1">
                  <div>env.API_BASE_URL: <strong className="text-text-primary">"https://api.trackflow.io/v1"</strong></div>
                  <div>secrets.OPENAI_API_KEY: <strong className="text-text-primary">"sk-••••••••••••••••"</strong></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-2">
              <div className="text-text-secondary font-semibold">Latest Selected Node Payload Data:</div>
              <pre className="bg-bg-secondary dark:bg-[#1a1b1c] p-2.5 rounded border border-border-primary/50 text-[10.5px] leading-relaxed text-purple-600 dark:text-purple-400 overflow-x-auto max-h-28">
{`{
  "trigger": {
    "event": "inbound_webhook",
    "customer": {
      "name": "Jane Doe",
      "email": "jane@google.com",
      "company": "Google LLC",
      "budget": 120000
    }
  },
  "nodes": {
    "ai_classification": {
      "output": {
        "priority": "high",
        "confidence": 0.96,
        "reasoning": "Company domain matches enterprise list and budget is above 100k threshold."
      }
    }
  }
}`}
              </pre>
            </div>
          )}

        </div>
      )}
    </footer>
  );
};
