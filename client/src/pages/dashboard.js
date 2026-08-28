import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import { getSocket } from '../services/socket';
import {
  Play,
  ArrowUpRight,
  Sparkles,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      // Re-fetch aggregated stats on background state changes
      fetchDashboardData();
    };

    socket.on('execution:state', handleUpdate);
    return () => {
      socket.off('execution:state', handleUpdate);
    };
  }, []);

  const metrics = data?.metrics || {};
  const recentExecutions = data?.recentExecutions || [];

  return (
    <AppShell>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Operator Console <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous orchestration of enterprise operations and AI agent chains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl border border-white/10 bg-surface-900 hover:bg-surface-800 text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
            <Link
              href="/workflows/builder"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" /> Prompt Builder
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <MetricGrid metrics={metrics} />

        {/* Two Column Layout: Recent Executions & AI Agent Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Executions Stream */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Execution Runs</h3>
                <p className="text-[11px] text-slate-400">Live multi-agent execution audit trail</p>
              </div>
              <Link
                href="/executions"
                className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
              >
                View all runs <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {loading && !data ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
              </div>
            ) : recentExecutions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                <p>No executions recorded yet.</p>
                <Link
                  href="/workflows/builder"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 text-xs border border-brand-500/30"
                >
                  <Sparkles className="w-3 h-3" /> Generate your first workflow
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentExecutions.map((exec) => {
                  const isSuccess = exec.status === 'COMPLETED';
                  const isRunning = exec.status === 'RUNNING' || exec.status === 'RETRYING';
                  const isFailed = exec.status === 'FAILED';

                  return (
                    <div
                      key={exec._id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isRunning
                              ? 'bg-purple-500/10 text-purple-400 animate-pulse'
                              : isFailed
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {isRunning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/executions/${exec._id}`}
                            className="text-xs font-semibold text-white hover:text-brand-400 truncate block"
                          >
                            {exec.workflowId?.name || 'Automated Workflow Run'}
                          </Link>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono">{exec.status}</span>
                            <span>•</span>
                            <span>{exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'Processing'}</span>
                            <span>•</span>
                            <span>{new Date(exec.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/executions/${exec._id}`}
                        className="px-3 py-1 rounded-lg border border-white/10 hover:border-brand-500/40 text-[11px] text-slate-300 hover:text-white transition-colors shrink-0"
                      >
                        Inspect
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Orchestration Pulse Panel */}
          <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl shadow-lg space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Active Agent Chain</h3>
              <p className="text-[11px] text-slate-400">Cooperating operations agents</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Planner Agent', desc: 'DAG topological sorting & confidence scoring', status: 'Online', color: 'text-sky-400' },
                { name: 'Execution Agent', desc: 'Tool runner for Gmail, Slack, Sheets & LLMs', status: 'Online', color: 'text-purple-400' },
                { name: 'Validation Agent', desc: 'Schema integrity & required field verification', status: 'Online', color: 'text-emerald-400' },
                { name: 'Recovery Agent', desc: 'Error classifier & exponential retry backoff', status: 'Online', color: 'text-amber-400' },
                { name: 'Monitoring Agent', desc: 'Real-time WebSocket streaming & audit persistence', status: 'Streaming', color: 'text-pink-400' },
              ].map((agent) => (
                <div
                  key={agent.name}
                  className="p-3 rounded-xl border border-white/5 bg-surface-100/40 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">{agent.name}</h5>
                    <p className="text-[10px] text-slate-400">{agent.desc}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 ${agent.color}`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">LangGraph Substrate</span>
              <span className="font-mono text-emerald-400 font-semibold">Available</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
