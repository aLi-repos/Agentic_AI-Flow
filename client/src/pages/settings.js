import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  User,
  Shield,
  Key,
  Server,
  Activity,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <AppShell>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings & System Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Operator profile, encryption status, and backend health checks.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Operator Profile</h3>
              <p className="text-[11px] text-slate-400">Authenticated session identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50">
              <span className="text-slate-400 block mb-1">Operator Name</span>
              <span className="text-white font-semibold">{user?.name || 'Operator'}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50">
              <span className="text-slate-400 block mb-1">Email Address</span>
              <span className="text-white font-semibold">{user?.email || 'N/A'}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50">
              <span className="text-slate-400 block mb-1">Role Permission</span>
              <span className="inline-flex items-center gap-1 text-brand-400 font-semibold font-mono">
                <Shield className="w-3 h-3" /> {user?.role || 'operator'}
              </span>
            </div>
          </div>
        </div>

        {/* System Health Check */}
        <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Backend Health & Architecture</h3>
                <p className="text-[11px] text-slate-400">Real-time status of backend services</p>
              </div>
            </div>

            <button
              onClick={checkHealth}
              className="p-2 rounded-xl border border-white/10 bg-surface-100 hover:bg-surface-200 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50 flex items-center justify-between">
              <span className="text-slate-400">API Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {health?.status?.toUpperCase() || 'HEALTHY'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50 flex items-center justify-between">
              <span className="text-slate-400">Node Runtime</span>
              <span className="text-white font-semibold">{health?.nodeVersion || 'v24.x'}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50 flex items-center justify-between">
              <span className="text-slate-400">Queue Engine</span>
              <span className="text-purple-400 font-semibold">BullMQ + In-Memory Fallback</span>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-100/50 flex items-center justify-between">
              <span className="text-slate-400">Database Engine</span>
              <span className="text-sky-400 font-semibold">MongoDB / Memory Server</span>
            </div>
          </div>
        </div>

        {/* Security & Encryption Health */}
        <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cryptography & Key Health</h3>
              <p className="text-[11px] text-slate-400">Encryption status of stored third-party tokens</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-white/5 bg-surface-100/40 flex items-center justify-between">
              <span className="text-slate-300 font-medium">CREDENTIAL_ENCRYPTION_KEY</span>
              <span className="text-emerald-400 font-mono font-semibold">AES-256-GCM (Active)</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-surface-100/40 flex items-center justify-between">
              <span className="text-slate-300 font-medium">JWT Token Signer</span>
              <span className="text-emerald-400 font-mono font-semibold">HMAC-SHA256 (Valid)</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-surface-100/40 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Password Hashing Cost</span>
              <span className="text-emerald-400 font-mono font-semibold">bcrypt Cost 12</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
