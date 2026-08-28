import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import {
  GitBranch,
  Plus,
  Search,
  Sparkles,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Tag,
} from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/workflows', { params });
      setWorkflows(res.data.data || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchWorkflows();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkflowName) return;

    try {
      setCreating(true);
      const res = await api.post('/workflows', {
        name: newWorkflowName,
        description: newWorkflowDesc,
        status: 'draft',
        nodes: [
          {
            id: 'trigger_1',
            type: 'trigger',
            position: { x: 150, y: 200 },
            data: { label: 'Webhook Trigger', triggerType: 'webhook' },
          },
          {
            id: 'ai_1',
            type: 'aiTask',
            position: { x: 480, y: 200 },
            data: { label: 'AI Processor', prompt: 'Process payload and generate summary' },
          },
        ],
        edges: [
          { id: 'e-1-2', source: 'trigger_1', target: 'ai_1', animated: true },
        ],
      });
      setIsCreateOpen(false);
      router.push(`/workflows/${res.data.data._id}`);
    } catch (err) {
      console.error('Failed to create workflow:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error('Failed to duplicate:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleExecute = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/execute`, { inputs: { manualTrigger: true } });
      router.push(`/executions/${res.data.data._id}`);
    } catch (err) {
      alert(`Execution failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <AppShell>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Workflows Catalog
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, configure, and orchestrate visual multi-agent workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workflows/builder"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Builder
            </Link>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-surface-100 hover:bg-surface-200 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-brand-400" /> New Workflow
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workflows by name, tag, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-100 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['', 'active', 'draft', 'paused'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white bg-surface-100/50'
                }`}
              >
                {status ? status.toUpperCase() : 'ALL STATUS'}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/10 bg-surface-900/60 backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No workflows found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Get started by typing an automation idea in natural language or creating a blank canvas.
            </p>
            <Link
              href="/workflows/builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> Prompt AI Builder
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflows.map((wf) => (
              <div
                key={wf._id}
                onClick={() => router.push(`/workflows/${wf._id}`)}
                className="p-5 rounded-2xl border border-white/10 bg-surface-900/80 hover:bg-surface-900 hover:border-brand-500/40 backdrop-blur-xl transition-all shadow-lg cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        v{wf.version || 1}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        wf.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {wf.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                    {wf.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {wf.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500">
                      {wf.nodes?.length || 0} nodes
                    </span>
                    {wf.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-100 text-slate-300 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={(e) => handleExecute(wf._id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3 h-3" /> Run
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicate(wf._id, e)}
                      title="Duplicate"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(wf._id, e)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Workflow Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-3xl border border-white/10 bg-surface-900 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Create New Workflow</h3>
              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Workflow Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Customer Support Triage"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what this workflow automates..."
                    value={newWorkflowDesc}
                    onChange={(e) => setNewWorkflowDesc(e.target.value)}
                    className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                  >
                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Canvas'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
