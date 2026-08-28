import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { X, Trash2, Sliders, Info } from 'lucide-react';

const NodeConfigPanel = () => {
  const { selectedNode, updateNodeData, deleteNode, selectNode } = useWorkflowStore();

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;

  const handleChange = (field, value) => {
    updateNodeData(id, { [field]: value });
  };

  return (
    <div className="w-80 h-full border-l border-white/10 bg-surface-900/95 backdrop-blur-xl flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Node Properties</h3>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node Label */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">Node Title</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Node Description */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">Description</label>
          <textarea
            rows={2}
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        {/* Type Specific Fields */}
        {type === 'trigger' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Trigger Type</label>
              <select
                value={data.triggerType || 'webhook'}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="webhook">Incoming Webhook</option>
                <option value="schedule">Cron Schedule</option>
                <option value="manual">Manual Execution</option>
              </select>
            </div>
            {data.triggerType === 'schedule' && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">Cron Expression</label>
                <input
                  type="text"
                  placeholder="0 9 * * *"
                  value={data.schedule || ''}
                  onChange={(e) => handleChange('schedule', e.target.value)}
                  className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>
        )}

        {type === 'aiTask' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">AI Model</label>
              <select
                value={data.model || 'gemini-1.5-flash'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                <option value="meta-llama/llama-3.3-70b-instruct">OpenRouter LLaMA 3.3 70B</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Agent Prompt / Instructions</label>
              <textarea
                rows={4}
                value={data.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                placeholder="Describe reasoning task or transformation..."
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 resize-none font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {type === 'gmail' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Action</label>
              <select
                value={data.action || 'send_email'}
                onChange={(e) => handleChange('action', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="send_email">Send Email</option>
                <option value="read_emails">Read Unread Messages</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Recipient (To)</label>
              <input
                type="text"
                placeholder="user@enterprise.com"
                value={data.to || ''}
                onChange={(e) => handleChange('to', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Subject</label>
              <input
                type="text"
                placeholder="Alert: {{nodes.ai_task_1.output.title}}"
                value={data.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Body (HTML/Text)</label>
              <textarea
                rows={3}
                value={data.body || ''}
                onChange={(e) => handleChange('body', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 resize-none font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {type === 'slack' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Channel</label>
              <input
                type="text"
                placeholder="#ops-alerts"
                value={data.channel || ''}
                onChange={(e) => handleChange('channel', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Message Content</label>
              <textarea
                rows={3}
                value={data.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="🚨 Event: {{nodes.ai_task_1.output.summary}}"
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 resize-none font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {type === 'discord' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Channel / Webhook Target</label>
              <input
                type="text"
                placeholder="general"
                value={data.channelId || ''}
                onChange={(e) => handleChange('channelId', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Message Content</label>
              <textarea
                rows={3}
                value={data.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="📢 **Incident**: {{nodes.ai_task_1.output.summary}}"
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 resize-none font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {type === 'googleSheets' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Spreadsheet ID</label>
              <input
                type="text"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={data.spreadsheetId || ''}
                onChange={(e) => handleChange('spreadsheetId', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Sheet Name</label>
              <input
                type="text"
                placeholder="Sheet1"
                value={data.sheetName || 'Sheet1'}
                onChange={(e) => handleChange('sheetName', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Row Values (JSON Array)</label>
              <input
                type="text"
                placeholder='["{{timestamp}}", "{{nodes.ai_task_1.output.summary}}"]'
                value={data.values || ''}
                onChange={(e) => handleChange('values', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {type === 'condition' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Field to Inspect</label>
              <input
                type="text"
                placeholder="priority"
                value={data.field || ''}
                onChange={(e) => handleChange('field', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Operator</label>
              <select
                value={data.operator || 'equals'}
                onChange={(e) => handleChange('operator', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Comparison Value</label>
              <input
                type="text"
                placeholder="URGENT"
                value={data.value || ''}
                onChange={(e) => handleChange('value', e.target.value)}
                className="w-full bg-surface-100 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {/* Template Variables Helper Info */}
        <div className="p-2.5 rounded-lg bg-surface-100/50 border border-white/5 flex items-start gap-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
          <span>
            Use <code className="text-brand-300">{'{{nodes.id.output.key}}'}</code> or <code className="text-brand-300">{'{{timestamp}}'}</code> to pass dynamic values between steps.
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-surface-900 flex justify-between items-center">
        <button
          onClick={() => deleteNode(id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Node
        </button>

        <span className="text-[10px] font-mono text-slate-500">ID: {id}</span>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
