import React, { useState } from 'react';
import {
  Zap,
  Bot,
  Mail,
  MessageSquare,
  Flame,
  Table,
  GitFork,
  Clock,
  Search,
  GripVertical,
} from 'lucide-react';

const PALETTE_ITEMS = [
  {
    category: 'Triggers',
    items: [
      {
        type: 'trigger',
        label: 'Webhook Trigger',
        description: 'Initiate workflow on incoming HTTP event',
        icon: Zap,
        color: 'from-amber-500 to-orange-600',
      },
    ],
  },
  {
    category: 'AI & Reasoning',
    items: [
      {
        type: 'aiTask',
        label: 'AI Reasoning Agent',
        description: 'Analyze, classify, or summarize data',
        icon: Bot,
        color: 'from-indigo-500 to-purple-600',
      },
    ],
  },
  {
    category: 'Integrations',
    items: [
      {
        type: 'gmail',
        label: 'Gmail Dispatch',
        description: 'Send emails or parse incoming mail',
        icon: Mail,
        color: 'from-red-500 to-rose-600',
      },
      {
        type: 'slack',
        label: 'Slack Message',
        description: 'Post alerts to channels or direct messages',
        icon: MessageSquare,
        color: 'from-emerald-500 to-teal-600',
      },
      {
        type: 'discord',
        label: 'Discord Alert',
        description: 'Post rich embeds or webhook notifications',
        icon: Flame,
        color: 'from-blue-500 to-indigo-600',
      },
      {
        type: 'googleSheets',
        label: 'Google Sheets',
        description: 'Append rows or query spreadsheet ranges',
        icon: Table,
        color: 'from-green-500 to-emerald-700',
      },
    ],
  },
  {
    category: 'Logic & Utility',
    items: [
      {
        type: 'condition',
        label: 'Conditional Branch',
        description: 'Evaluate fields and route execution',
        icon: GitFork,
        color: 'from-cyan-500 to-blue-600',
      },
      {
        type: 'delay',
        label: 'Wait / Delay',
        description: 'Pause execution for a specified duration',
        icon: Clock,
        color: 'from-slate-500 to-zinc-600',
      },
    ],
  },
];

const NodePalette = () => {
  const [search, setSearch] = useState('');

  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/agentflow-node-type', nodeType);
    event.dataTransfer.setData('application/agentflow-node-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = PALETTE_ITEMS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="w-72 h-full border-r border-white/10 bg-surface-900/90 backdrop-blur-xl flex flex-col select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Node Library
        </h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-100/80 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Palette list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {filteredCategories.map((cat) => (
          <div key={cat.category}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-1 mb-2">
              {cat.category}
            </div>
            <div className="space-y-1.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.label)}
                    className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-white/[0.06] bg-surface-100/50 hover:bg-surface-100 hover:border-brand-500/40 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div
                      className={`p-2 rounded-md bg-gradient-to-br ${item.color} text-white shadow-sm shrink-0`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {item.label}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-white/10 text-[11px] text-slate-500 text-center">
        Drag & drop nodes onto canvas
      </div>
    </div>
  );
};

export default NodePalette;
