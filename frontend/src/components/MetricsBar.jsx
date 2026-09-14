import React, { useEffect, useRef } from 'react';
import { Users, Target, CheckSquare, Briefcase, TrendingUp, RefreshCw } from 'lucide-react';

function AnimatedNumber({ value, duration = 600 }) {
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      if (ref.current) ref.current.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else prevValue.current = end;
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span ref={ref}>{value}</span>;
}

const METRICS = [
  { key: 'totalLeads', label: 'Total Leads', icon: Users, color: 'indigo' },
  { key: 'activeLeads', label: 'Active Pipeline', icon: Target, color: 'violet' },
  { key: 'pendingTasks', label: 'Tasks Pending', icon: CheckSquare, color: 'amber' },
  { key: 'clientsWon', label: 'Clients & Won', icon: Briefcase, color: 'emerald' },
  { key: 'revenue', label: 'Pipeline Value', icon: TrendingUp, color: 'sky', isCurrency: true },
];

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-400/60' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-400/60' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-400/60' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-400/60' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', icon: 'text-sky-400/60' },
};

export default function MetricsBar({ leads, tasks, clients, loading, onRefresh }) {
  const activeLeads = leads.filter(l => l.status === 'active').length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
  const totalRevenue = leads.reduce((sum, l) => sum + (parseFloat(l.deal_value) || 0), 0);

  const values = {
    totalLeads: leads.length,
    activeLeads,
    pendingTasks,
    clientsWon: wonLeads + clients.length,
    revenue: totalRevenue,
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-6">
      <div className="flex items-center gap-3">
        {METRICS.map(m => {
          const Icon = m.icon;
          const c = COLOR_MAP[m.color];
          return (
            <div key={m.key} className={`flex-1 ${c.bg} rounded-xl p-3 flex items-center justify-between transition-all duration-300 hover:shadow-sm`}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</p>
                <p className={`text-xl font-bold ${c.text} mt-0.5`}>
                  {m.isCurrency && <span className="text-sm font-semibold opacity-60">R </span>}
                  <AnimatedNumber value={Math.round(values[m.key])} />
                </p>
              </div>
              <Icon className={`w-7 h-7 ${c.icon}`} />
            </div>
          );
        })}

        <button
          onClick={onRefresh}
          title="Refresh all data"
          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-90"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>
    </div>
  );
}

