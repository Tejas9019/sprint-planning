import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  icon: string;
  category: 'trigger' | 'logic' | 'ai' | 'integration' | 'developer';
  status: 'idle' | 'running' | 'success' | 'warning' | 'failed';
  executionCount?: number;
  duration?: string;
  description?: string;
  config?: any;
}

const statusColors = {
  idle: 'border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6]',
  running: 'border-blue-500 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.35)] dark:bg-blue-950/20 text-blue-400',
  success: 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_12px_rgba(16,185,129,0.35)] dark:bg-emerald-950/20 text-emerald-400',
  warning: 'border-amber-500 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.35)] dark:bg-amber-950/20 text-amber-400',
  failed: 'border-rose-500 bg-rose-500/5 shadow-[0_0_12px_rgba(244,63,94,0.35)] dark:bg-rose-950/20 text-rose-400',
};

const categoryGradients = {
  trigger: 'from-amber-500/20 to-orange-500/5 text-amber-500 dark:text-amber-400 border-amber-500/20',
  logic: 'from-blue-500/20 to-indigo-500/5 text-blue-500 dark:text-blue-400 border-blue-500/20',
  ai: 'from-purple-500/20 to-pink-500/5 text-purple-500 dark:text-purple-400 border-purple-500/20',
  integration: 'from-emerald-500/20 to-teal-500/5 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
  developer: 'from-slate-500/20 to-zinc-500/5 text-slate-400 dark:text-slate-300 border-slate-500/20',
};

export const CustomNode = ({ data, selected }: { data: CustomNodeData; selected?: boolean }) => {
  // Dynamically resolve lucide icon
  const IconComponent = (Icons as any)[data.icon] || Icons.HelpCircle;

  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-xl border transition-all duration-200 select-none ${
        selected ? 'ring-2 ring-purple-500/70 border-purple-500/50 scale-[1.02]' : ''
      } ${statusColors[data.status] || statusColors.idle}`}
    >
      {/* Node Header */}
      <div className={`flex items-center gap-3 px-3.5 py-3 border-b rounded-t-xl bg-gradient-to-r ${categoryGradients[data.category] || categoryGradients.developer} border-neutral-200 dark:border-neutral-800`}>
        <div className="p-1.5 rounded-lg bg-white dark:bg-[#1a1b1c] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <IconComponent size={18} className="stroke-[2.2]" />
        </div>
        <div className="flex-grow min-w-0">
          <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 truncate">{data.label}</div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate capitalize font-medium">{data.category}</div>
        </div>

        {/* Status indicator badge */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {data.status === 'running' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                data.status === 'success'
                  ? 'bg-emerald-500'
                  : data.status === 'failed'
                  ? 'bg-rose-500'
                  : data.status === 'warning'
                  ? 'bg-amber-500'
                  : data.status === 'running'
                  ? 'bg-blue-500'
                  : 'bg-slate-400 dark:bg-slate-600'
              }`}
            ></span>
          </span>
        </div>
      </div>

      {/* Node Body */}
      <div className="px-3.5 py-2.5 space-y-2 text-xs">
        {data.description && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Runtime Statistics */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1">
            <Icons.Play size={10} className="text-neutral-400" />
            <span>Execs: <strong className="text-neutral-700 dark:text-neutral-200 font-semibold">{data.executionCount ?? 0}</strong></span>
          </div>
          {data.duration && (
            <div className="flex items-center gap-1">
              <Icons.Clock size={10} className="text-neutral-400" />
              <span>{data.duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Single Handle circle per direction */}
      {/* TOP: Target */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style={{
          background: '#a855f7',
          width: 8,
          height: 8,
          border: '2px solid #202124',
        }}
      />

      {/* BOTTOM: Source */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style={{
          background: '#a855f7',
          width: 8,
          height: 8,
          border: '2px solid #202124',
        }}
      />

      {/* LEFT: Target */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style={{
          background: '#a855f7',
          width: 8,
          height: 8,
          border: '2px solid #202124',
        }}
      />

      {/* RIGHT: Source */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style={{
          background: '#a855f7',
          width: 8,
          height: 8,
          border: '2px solid #202124',
        }}
      />

      {/* Fallback legacy handles */}
      {data.category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          style={{
            background: '#a855f7',
            width: 8,
            height: 8,
            border: '2px solid #202124',
            opacity: 0,
          }}
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{
          background: '#a855f7',
          width: 8,
          height: 8,
          border: '2px solid #202124',
          opacity: 0,
        }}
      />

      {/* Fallback legacy handles for default React Flow connections */}
      {data.category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          style={{
            background: '#a855f7',
            width: 8,
            height: 8,
            border: '2px solid #202124',
            opacity: 0,
          }}
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        style={{
          background: '#a855f7',
          width: 8,
          height: 8,
          border: '2px solid #202124',
          opacity: 0,
        }}
      />
    </div>
  );
};
