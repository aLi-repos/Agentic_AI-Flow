import React from 'react';
import { useRouter } from 'next/router';
import { Bell, Sparkles, Activity, Plus } from 'lucide-react';
import Link from 'next/link';

const Header = ({ onOpenNotifications, unreadCount = 0 }) => {
  const router = useRouter();

  // Generate breadcrumb from pathname
  const pathParts = router.pathname.split('/').filter(Boolean);
  const title =
    pathParts.length === 0
      ? 'Dashboard'
      : pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);

  return (
    <header className="h-16 border-b border-white/10 bg-surface-900/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-20">
      {/* Breadcrumb & Path */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
        {pathParts.length > 1 && (
          <>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 font-mono">
              {router.query.id || pathParts[1]}
            </span>
          </>
        )}
      </div>

      {/* Agent pulse & quick actions */}
      <div className="flex items-center gap-4">
        {/* Multi-Agent Live Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-surface-100/50 text-[11px] text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-emerald-400 font-medium">5 AI AGENTS READY</span>
        </div>

        {/* Prompt Builder quick button */}
        <Link
          href="/workflows/builder"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" /> Prompt-to-Workflow
        </Link>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-surface-900" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
