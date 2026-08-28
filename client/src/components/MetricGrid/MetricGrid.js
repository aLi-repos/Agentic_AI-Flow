import React from 'react';
import {
  GitBranch,
  PlayCircle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';

const MetricGrid = ({ metrics = {} }) => {
  const cards = [
    {
      title: 'Total Workflows',
      value: metrics.totalWorkflows ?? 0,
      subtext: `${metrics.activeWorkflows ?? 0} actively deployed`,
      icon: GitBranch,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400',
    },
    {
      title: 'Total Executions',
      value: metrics.totalRuns ?? 0,
      subtext: `${metrics.activeRuns ?? 0} currently processing`,
      icon: PlayCircle,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-400',
    },
    {
      title: 'Multi-Agent Success Rate',
      value: `${metrics.successRate ?? 100}%`,
      subtext: `${metrics.failedRuns ?? 0} escalations caught`,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Avg Agent Latency',
      value: `${metrics.avgDuration ? (metrics.avgDuration / 1000).toFixed(2) : '0.45'}s`,
      subtext: '5 agents per pipeline run',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-white mt-1.5 font-mono">
                  {card.value}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-brand-400" /> {card.subtext}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom accent glow */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.color} opacity-40 group-hover:opacity-100 transition-opacity`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MetricGrid;
