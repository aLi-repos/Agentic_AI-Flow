import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Bot,
  Mail,
  MessageSquare,
  Flame,
  Table,
  GitFork,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const NODE_CONFIGS = {
  trigger: {
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/40',
    badge: 'TRIGGER',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  aiTask: {
    icon: Bot,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500/40',
    badge: 'AI AGENT',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  gmail: {
    icon: Mail,
    color: 'from-red-500 to-rose-600',
    borderColor: 'border-red-500/40',
    badge: 'GMAIL',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  slack: {
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40',
    badge: 'SLACK',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  discord: {
    icon: Flame,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/40',
    badge: 'DISCORD',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  googleSheets: {
    icon: Table,
    color: 'from-green-500 to-emerald-700',
    borderColor: 'border-green-500/40',
    badge: 'SHEETS',
    badgeBg: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  condition: {
    icon: GitFork,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    badge: 'LOGIC',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  delay: {
    icon: Clock,
    color: 'from-slate-500 to-zinc-600',
    borderColor: 'border-slate-500/40',
    badge: 'DELAY',
    badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
};

const CustomWorkflowNode = ({ data, selected, type, id }) => {
  const nodeType = type || data.type || 'trigger';
  const cfg = NODE_CONFIGS[nodeType] || NODE_CONFIGS.trigger;
  const Icon = cfg.icon;

  const isCurrent = data.isCurrentNode;
  const isCompleted = data.isCompleted;
  const isFailed = data.isFailed;

  return (
    <div
      className={`relative min-w-[240px] max-w-[280px] rounded-xl border backdrop-blur-xl transition-all duration-200 shadow-2xl ${
        selected
          ? 'border-brand-400 bg-surface-100/95 ring-2 ring-brand-500/50 shadow-brand-500/20'
          : isCurrent
          ? 'border-agent-execution bg-surface-100/95 ring-2 ring-agent-execution/60 animate-pulse'
          : isFailed
          ? 'border-red-500 bg-surface-100/90 ring-2 ring-red-500/40'
          : isCompleted
          ? 'border-emerald-500/40 bg-surface-100/80'
          : `${cfg.borderColor} bg-surface-100/85 hover:border-slate-400/50`
      }`}
    >
      {/* Input connection handle (except for trigger) */}
      {nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-brand-400 !border-2 !border-surface-900 transition-transform hover:!scale-125"
        />
      )}

      {/* Header bar */}
      <div className="p-3.5 pb-2 flex items-start gap-3">
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${cfg.color} text-white shadow-md shadow-black/30 shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${cfg.badgeBg}`}>
              {cfg.badge}
            </span>
            {isCurrent && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-purple-400">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Running
              </span>
            )}
            {isCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {isFailed && (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            )}
          </div>
          <h4 className="text-xs font-semibold text-white truncate">{data.label || 'Workflow Node'}</h4>
        </div>
      </div>

      {/* Body content preview */}
      <div className="px-3.5 pb-3 pt-1 border-t border-white/[0.05]">
        <p className="text-[11px] text-slate-400 truncate">
          {data.description ||
            (nodeType === 'aiTask' && (data.prompt || 'AI Reasoning & Classification')) ||
            (nodeType === 'gmail' && (data.to ? `To: ${data.to}` : 'Send Email')) ||
            (nodeType === 'slack' && (data.channel ? `Channel: ${data.channel}` : 'Post message')) ||
            (nodeType === 'discord' && (data.channelId ? `Channel: ${data.channelId}` : 'Send alert')) ||
            (nodeType === 'googleSheets' && (data.sheetName ? `Sheet: ${data.sheetName}` : 'Append row')) ||
            (nodeType === 'condition' && (data.field ? `Check: ${data.field}` : 'Branch logic')) ||
            'Configured step'}
        </p>
      </div>

      {/* Output connection handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-brand-400 !border-2 !border-surface-900 transition-transform hover:!scale-125"
      />
    </div>
  );
};

export const TriggerNode = memo((props) => <CustomWorkflowNode {...props} type="trigger" />);
export const AITaskNode = memo((props) => <CustomWorkflowNode {...props} type="aiTask" />);
export const GmailNode = memo((props) => <CustomWorkflowNode {...props} type="gmail" />);
export const SlackNode = memo((props) => <CustomWorkflowNode {...props} type="slack" />);
export const DiscordNode = memo((props) => <CustomWorkflowNode {...props} type="discord" />);
export const GoogleSheetsNode = memo((props) => <CustomWorkflowNode {...props} type="googleSheets" />);
export const ConditionNode = memo((props) => <CustomWorkflowNode {...props} type="condition" />);
export const DelayNode = memo((props) => <CustomWorkflowNode {...props} type="delay" />);

export const nodeTypes = {
  trigger: TriggerNode,
  aiTask: AITaskNode,
  gmail: GmailNode,
  slack: SlackNode,
  discord: DiscordNode,
  googleSheets: GoogleSheetsNode,
  condition: ConditionNode,
  delay: DelayNode,
};
