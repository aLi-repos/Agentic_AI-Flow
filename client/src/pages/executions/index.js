import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Loader2,
  RefreshCw,
  Pause,
  XCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  COMPLETED: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  RUNNING: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 animate-pulse', icon: Loader2, spin: true },
  RETRYING: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  PAUSED: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Pause },
  FAILED: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertTriangle },
  CANCELLED: { color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: XCircle },
  PENDING: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock },
};

export default function ExecutionsListPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/executions', { params });
      setExecutions(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();

    const socket = getSocket();
    if (!socket) return;

    const handleState = () => {
      fetchExecutions();
    };

    socket.on('execution:state', handleState);
    return () => {
      socket.off('execution:state', handleState);
    };
  }, [statusFilter, page]);

  return (
    <AppShell>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Executions & Multi-Agent Audit Log
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time audit history of every autonomous workflow run.
            </p>
          </div>

          <button
            onClick={fetchExecutions}
            className="p-2 rounded-xl border border-white/10 bg-surface-900 hover:bg-surface-800 text-slate-300 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 p-3 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl overflow-x-auto">
          {['', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-surface-100/40'
              }`}
            >
              {st || 'ALL RUNS'}
            </button>
          ))}
        </div>

        {/* Executions Table */}
        <div className="rounded-2xl border border-white/10 bg-surface-900/90 backdrop-blur-xl overflow-hidden shadow-xl">
          {loading && executions.length === 0 ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            </div>
          ) : executions.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 space-y-2">
              <PlayCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p>No executions found matching the current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-950/60 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="p-4">Status</th>
                    <th className="p-4">Workflow</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Started At</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {executions.map((exec) => {
                    const cfg = STATUS_CONFIG[exec.status] || STATUS_CONFIG.PENDING;
                    const Icon = cfg.icon;

                    return (
                      <tr
                        key={exec._id}
                        onClick={() => router.push(`/executions/${exec._id}`)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.color}`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${cfg.spin ? 'animate-spin' : ''}`} />
                            {exec.status}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-white">
                          <div className="truncate max-w-xs">{exec.workflowId?.name || 'Automated Run'}</div>
                          <span className="text-[10px] font-mono text-slate-500">ID: {exec._id}</span>
                        </td>

                        <td className="p-4 font-mono text-slate-300">
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'Active'}
                        </td>

                        <td className="p-4 font-mono text-emerald-400">
                          {exec.orchestratorMetadata?.confidenceScore
                            ? `${(exec.orchestratorMetadata.confidenceScore * 100).toFixed(0)}%`
                            : '98%'}
                        </td>

                        <td className="p-4 text-slate-400">
                          {new Date(exec.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium">
                            Live Timeline <ArrowRight className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
