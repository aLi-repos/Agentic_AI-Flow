import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { joinExecutionRoom, leaveExecutionRoom, getSocket } from '../../services/socket';
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Terminal,
  Activity,
  Layers,
  Code2,
  Clock,
} from 'lucide-react';

const AGENT_BADGES = {
  planner: { name: 'Planner Agent', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  execution: { name: 'Execution Agent', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  validation: { name: 'Validation Agent', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  recovery: { name: 'Recovery Agent', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  monitoring: { name: 'Monitoring Agent', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedNodeOutput, setSelectedNodeOutput] = useState(null);

  const logsEndRef = useRef(null);

  const fetchExecutionData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [execRes, timelineRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`),
      ]);
      setExecution(execRes.data.data);
      setLogs(timelineRes.data.data || []);
    } catch (err) {
      console.error('Failed to load execution data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchExecutionData();
    joinExecutionRoom(id);

    const socket = getSocket();
    if (!socket) return;

    const handleLog = (logItem) => {
      setLogs((prev) => [...prev, logItem]);
    };

    const handleState = (stateChange) => {
      setExecution((prev) => (prev ? { ...prev, ...stateChange } : prev));
      if (stateChange.status === 'COMPLETED' || stateChange.status === 'FAILED') {
        // Re-sync full object
        api.get(`/executions/${id}`).then((res) => setExecution(res.data.data)).catch(() => {});
      }
    };

    socket.on('execution:log', handleLog);
    socket.on('execution:state', handleState);

    return () => {
      socket.off('execution:log', handleLog);
      socket.off('execution:state', handleState);
      leaveExecutionRoom(id);
    };
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      await api.post(`/executions/${id}/pause`);
      setExecution((prev) => ({ ...prev, status: 'PAUSED' }));
    } catch (err) {
      alert(`Pause failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await api.post(`/executions/${id}/resume`);
      setExecution((prev) => ({ ...prev, status: 'RUNNING' }));
    } catch (err) {
      alert(`Resume failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this execution?')) return;
    try {
      setActionLoading(true);
      await api.post(`/executions/${id}/cancel`);
      setExecution((prev) => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      alert(`Cancel failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const isRunning = execution?.status === 'RUNNING' || execution?.status === 'RETRYING';
  const isPaused = execution?.status === 'PAUSED';
  const isCompleted = execution?.status === 'COMPLETED';
  const isFailed = execution?.status === 'FAILED';

  return (
    <AppShell>
      <div className="h-full flex flex-col overflow-hidden bg-surface-950">
        {/* Top Control Bar */}
        <div className="h-16 border-b border-white/10 bg-surface-900/90 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/executions"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-white truncate">
                  {execution?.workflowId?.name || 'Execution Run'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isRunning
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse'
                      : isFailed
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {execution?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ID: {id} • Substrate: {execution?.orchestratorMetadata?.langGraph || 'LangGraph Core'}
              </p>
            </div>
          </div>

          {/* Execution Controls */}
          <div className="flex items-center gap-2.5">
            {isRunning && (
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 text-xs font-semibold transition-all"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}

            {isPaused && (
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
              >
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
            )}

            {(isRunning || isPaused) && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-semibold transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            )}

            {execution?.duration ? (
              <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-400 bg-surface-100 px-3 py-1.5 rounded-xl border border-white/5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                {(execution.duration / 1000).toFixed(2)}s
              </span>
            ) : null}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left: Real-time Multi-Agent Timeline Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-surface-950 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-400" /> Live Agent Execution Log Stream
              </span>
              <span className="text-[10px] text-slate-500">{logs.length} Events Persisted</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400 mb-2" />
                Awaiting agent pipeline initialization...
              </div>
            ) : (
              logs.map((log, idx) => {
                const badge = AGENT_BADGES[log.agent] || AGENT_BADGES.monitoring;
                const isError = log.level === 'error';
                const isSuccess = log.level === 'success';

                return (
                  <div
                    key={log._id || idx}
                    className={`p-3.5 rounded-xl border ${
                      isError
                        ? 'border-red-500/30 bg-red-500/5'
                        : isSuccess
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-white/5 bg-surface-900/60'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${badge.color}`}
                        >
                          {badge.name}
                        </span>
                        {log.nodeId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                            node: {log.nodeId}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] ${
                        isError ? 'text-red-300' : isSuccess ? 'text-emerald-300' : 'text-slate-200'
                      }`}
                    >
                      {log.message}
                    </p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2 text-[10px] text-slate-400">
                        <summary className="cursor-pointer hover:text-slate-200 select-none">
                          View Event Payload
                        </summary>
                        <pre className="mt-1.5 p-2.5 rounded-lg bg-surface-950 border border-white/5 overflow-x-auto text-[10px] text-slate-300">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Right: Node Outputs & Graph Snapshot Inspector */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-surface-900/90 p-5 overflow-y-auto space-y-5 shrink-0">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand-400" /> Node Outputs Inspector
              </h3>

              {execution?.nodeOutputs && Object.keys(execution.nodeOutputs).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(execution.nodeOutputs).map(([nodeId, output]) => (
                    <div
                      key={nodeId}
                      className="p-3 rounded-xl border border-white/10 bg-surface-100/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white font-mono">{nodeId}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">OK</span>
                      </div>
                      <pre className="p-2 rounded-lg bg-surface-950 border border-white/5 text-[10px] text-slate-300 overflow-x-auto max-h-40 font-mono">
                        {JSON.stringify(output, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No node outputs captured yet.</p>
              )}
            </div>

            {/* Error Diagnostics if failed */}
            {execution?.error && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 space-y-1 text-xs">
                <h4 className="font-bold text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Error Diagnostics
                </h4>
                <p className="text-[11px] text-red-200">{execution.error.message}</p>
                <p className="text-[10px] font-mono text-red-400 mt-1">Code: {execution.error.code}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
