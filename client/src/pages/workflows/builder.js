import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import {
  Sparkles,
  ArrowRight,
  Play,
  Save,
  Loader2,
  Cpu,
  Bot,
  Zap,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

const PRESET_PROMPTS = [
  {
    title: 'Customer Triage & Slack Alert',
    prompt: 'When an incoming support ticket arrives, analyze urgency with AI, classify priority, and post an alert to Slack #ops-alerts.',
  },
  {
    title: 'Invoice Processing & Google Sheets',
    prompt: 'Extract invoice total and vendor name with AI, evaluate if amount is over $1,000, and log details to Google Sheets.',
  },
  {
    title: 'Incident Diagnosis & Discord / Gmail',
    prompt: 'When a critical error webhook triggers, run root cause reasoning with AI and dispatch notifications to Discord and Gmail.',
  },
];

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [saving, setSaving] = useState(false);

  const { setWorkflow } = useWorkflowStore();

  const handleGenerate = async (targetPrompt) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt) return;

    try {
      setGenerating(true);
      const res = await api.post('/workflows/generate', { prompt: activePrompt });
      const data = res.data.data;
      setGeneratedWorkflow(data);
      setWorkflow(data);
    } catch (err) {
      alert(`Generation failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedWorkflow) return;
    try {
      setSaving(true);
      const res = await api.post('/workflows', {
        name: generatedWorkflow.name,
        description: generatedWorkflow.description,
        status: 'active',
        triggerConfig: generatedWorkflow.triggerConfig || { type: 'webhook' },
        nodes: generatedWorkflow.nodes,
        edges: generatedWorkflow.edges,
        tags: generatedWorkflow.tags || ['AI Generated'],
      });
      router.push(`/workflows/${res.data.data._id}`);
    } catch (err) {
      alert(`Failed to save workflow: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteImmediately = async () => {
    if (!generatedWorkflow) return;
    try {
      setSaving(true);
      // 1. Save workflow
      const saveRes = await api.post('/workflows', {
        name: generatedWorkflow.name,
        description: generatedWorkflow.description,
        status: 'active',
        triggerConfig: generatedWorkflow.triggerConfig || { type: 'webhook' },
        nodes: generatedWorkflow.nodes,
        edges: generatedWorkflow.edges,
        tags: generatedWorkflow.tags || ['AI Generated'],
      });
      const wfId = saveRes.data.data._id;

      // 2. Execute
      const execRes = await api.post(`/workflows/${wfId}/execute`, {
        inputs: { source: 'ai_builder_quick_run' },
      });
      router.push(`/executions/${execRes.data.data._id}`);
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col overflow-hidden bg-surface-950">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-surface-900/90 backdrop-blur-xl shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Prompt-to-Workflow AI Compiler
            </h1>
            <p className="text-[11px] text-slate-400">
              Type your intent in plain English to construct a fully connected multi-agent DAG.
            </p>
          </div>

          {generatedWorkflow && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAndOpen}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-surface-100 hover:bg-surface-200 text-white text-xs font-semibold transition-all"
              >
                <Save className="w-3.5 h-3.5 text-brand-400" /> Open in Canvas Editor
              </button>

              <button
                onClick={handleExecuteImmediately}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Play className="w-3.5 h-3.5" /> Save & Execute Now
              </button>
            </div>
          )}
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left Prompt Input Panel */}
          <div className="w-full lg:w-96 p-5 border-b lg:border-b-0 lg:border-r border-white/10 bg-surface-900/95 overflow-y-auto space-y-5 shrink-0">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Natural Language Instructions
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your automation... (e.g. When a support ticket comes in, analyze urgency with AI and alert Slack)"
                className="w-full bg-surface-100 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none shadow-inner"
              />

              <button
                onClick={() => handleGenerate()}
                disabled={generating || !prompt.trim()}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Compiling Multi-Agent Graph...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Workflow Graph
                  </>
                )}
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Industry Blueprint Prompts
              </span>
              <div className="space-y-2">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      setPrompt(preset.prompt);
                      handleGenerate(preset.prompt);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-white/5 bg-surface-100/40 hover:bg-surface-100 hover:border-brand-500/30 transition-all text-xs group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-brand-300">
                      <span>{preset.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generator Info */}
            {generatedWorkflow && (
              <div className="p-3 rounded-xl border border-white/10 bg-surface-100/40 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Generated Nodes:</span>
                  <span className="font-mono text-white font-semibold">
                    {generatedWorkflow.nodes?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Compiler Engine:</span>
                  <span className="font-mono text-brand-400 font-semibold">
                    {generatedWorkflow.generatorUsed || 'Rule Engine'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Graph Preview Panel */}
          <div className="flex-1 h-full min-h-[400px] relative bg-surface-950">
            {generatedWorkflow ? (
              <WorkflowCanvas readonly={true} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-surface-900 border border-white/10 flex items-center justify-center text-brand-400 shadow-xl shadow-brand-500/10">
                  <Bot className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-base font-bold text-white">AI Workflow Canvas Awaiting Prompt</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Select a template on the left or enter any operational requirement to compile a visual graph instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
