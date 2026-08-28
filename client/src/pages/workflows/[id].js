import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodePalette from '../../components/NodePalette/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import {
  Save,
  Play,
  Copy,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    workflow,
    nodes,
    edges,
    selectedNode,
    isDirty,
    isSaving,
    setWorkflow,
    setSaving,
    resetDirty,
  } = useWorkflowStore();

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workflows/${id}`);
        setWorkflow(res.data.data);
      } catch (err) {
        console.error('Failed to load workflow:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, setWorkflow]);

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const res = await api.put(`/workflows/${id}`, {
        name: workflow?.name,
        description: workflow?.description,
        status: workflow?.status,
        triggerConfig: workflow?.triggerConfig,
        nodes,
        edges,
        tags: workflow?.tags,
      });
      setWorkflow(res.data.data);
      resetDirty();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert(`Failed to save workflow: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!id) return;
    try {
      setExecuting(true);
      // Auto-save if dirty before executing
      if (isDirty) {
        await api.put(`/workflows/${id}`, { nodes, edges });
        resetDirty();
      }

      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: { source: 'workflow_editor_manual_run' },
      });
      router.push(`/executions/${res.data.data._id}`);
    } catch (err) {
      alert(`Execution trigger failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <AppShell>
      <div className="h-full flex flex-col overflow-hidden bg-surface-950">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-white/10 bg-surface-900/90 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-20">
          {/* Left info & back */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/workflows"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Back to workflows"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-2">
                {workflow?.name || 'Loading Workflow...'}
                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
                )}
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                v{workflow?.version || 1} • {nodes.length} Nodes • {edges.length} Edges
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className={`p-2 rounded-lg border text-xs transition-colors hidden sm:flex items-center gap-1.5 ${
                paletteOpen
                  ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                  : 'border-white/10 bg-surface-100 text-slate-400 hover:text-white'
              }`}
              title="Toggle Node Palette"
            >
              <Layers className="w-3.5 h-3.5" /> Palette
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                saveSuccess
                  ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                  : isDirty
                  ? 'border-brand-500/40 bg-brand-500/20 text-brand-300 hover:bg-brand-500/30'
                  : 'border-white/10 bg-surface-100 text-slate-300 hover:text-white'
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Saved
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-brand-400" /> Save
                </>
              )}
            </button>

            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              {executing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Run Workflow
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Main Canvas Area */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Left Node Palette */}
          {paletteOpen && <NodePalette />}

          {/* Center Canvas */}
          <div className="flex-1 h-full relative">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
              </div>
            ) : (
              <WorkflowCanvas />
            )}
          </div>

          {/* Right Node Configuration Panel */}
          {selectedNode && <NodeConfigPanel />}
        </div>
      </div>
    </AppShell>
  );
}
