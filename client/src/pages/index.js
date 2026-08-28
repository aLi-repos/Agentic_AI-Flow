import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Bot,
  CheckCircle2,
  GitBranch,
  Layers,
  Terminal,
  Activity,
  Play,
  Flame,
  Mail,
  Table,
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);

  const AGENTS = [
    { name: '1. Planner Agent', role: 'Analyzes topology, resolves dependencies, and builds execution order.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { name: '2. Execution Agent', role: 'Executes nodes across Gmail, Slack, Sheets & LLMs with dynamic templates.', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { name: '3. Validation Agent', role: 'Verifies required output schemas, field presence, and data integrity.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { name: '4. Recovery Agent', role: 'Classifies failure modes and orchestrates exponential backoff retries.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { name: '5. Monitoring Agent', role: 'Streams real-time timeline events over Socket.IO and writes audit logs.', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-white selection:bg-brand-500 selection:text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/10 bg-surface-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-brand-500/30">
              ⚡
            </div>
            <span className="text-base font-bold tracking-tight">
              Agentflow<span className="text-brand-400">_AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
                >
                  Launch Console <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-medium mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Next-Generation Autonomous Multi-Agent Workflows
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Describe Automations in Plain English.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Execute via 5 Cooperating AI Agents.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mt-6">
          Turn natural language prompts into drag-and-drop React Flow graphs. Connect Gmail, Slack, Discord, and Google Sheets with end-to-end encryption, automated recovery, and live streaming audit trails.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-sm font-semibold shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" /> Start Building Workflows
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-surface-900/80 hover:bg-surface-800 text-sm font-medium text-slate-200 transition-all"
          >
            Operator Login
          </Link>
        </div>
      </section>

      {/* Multi-Agent Showcase Interactive Widget */}
      <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-surface-900/90 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
                ORCHESTRATION ENGINE
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                The 5-Agent Execution Pipeline
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              Substrate: <span className="font-mono text-white">LangGraph / Core Orchestrator</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {AGENTS.map((agent, idx) => (
              <div
                key={agent.name}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeStep === idx
                    ? `${agent.color} ring-2 ring-white/20 shadow-lg scale-102`
                    : 'border-white/5 bg-surface-100/40 hover:bg-surface-100/70 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10">
                    STAGE {idx + 1}
                  </span>
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1.5">{agent.name}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for High-Reliability Operations
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Every layer designed for precision, resilience, and real-time operator observability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/60 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white w-fit mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Prompt to Workflow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe your automation intent in natural language. Our AI compiler produces valid graph topologies, node coordinate layouts, and execution parameters instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/60 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white w-fit mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Encrypted Integrations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real OAuth and webhook integrations for Gmail, Slack, Discord, and Google Sheets. Access tokens are encrypted at rest with AES-256-GCM and never exposed in logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-surface-900/60 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-fit mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Live Timeline Streaming</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Watch execution steps materialize in real time via Socket.IO. Pause, resume, or cancel runs on the fly, with automated error classification and backoff retries.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Agentflow_AI. Enterprise Multi-Agent Operations Automation.</p>
      </footer>
    </div>
  );
}
