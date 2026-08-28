import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Sparkles,
  GitBranch,
  PlayCircle,
  Cpu,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'AI' },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Executions', href: '/executions', icon: PlayCircle },
  { name: 'Integrations', href: '/integrations', icon: Cpu },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isActive = (href) => {
    if (href === '/dashboard' && router.pathname === '/dashboard') return true;
    if (href !== '/dashboard' && router.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 h-screen border-r border-white/10 bg-surface-900 flex flex-col shrink-0 select-none">
      {/* Brand logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              Agentflow<span className="text-brand-400">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">OPERATIONS CONSOLE</p>
          </div>
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
          Platform
        </div>
        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-white/10 bg-surface-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-surface-100/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'O'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-brand-400" /> {user?.role || 'operator'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
