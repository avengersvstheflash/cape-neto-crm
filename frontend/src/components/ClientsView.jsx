import React, { useMemo } from 'react';
import { Building2, Calendar, Mail, TrendingUp } from 'lucide-react';

const PLAN_STYLES = {
  starter: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Starter' },
  growth: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Growth' },
  pro: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Pro' },
  enterprise: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Enterprise' },
};

const STATUS_STYLES = {
  active: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  paused: { dot: 'bg-amber-500', text: 'text-amber-700' },
  churned: { dot: 'bg-rose-500', text: 'text-rose-700' },
  trial: { dot: 'bg-sky-500', text: 'text-sky-700' },
};

export default function ClientsView({ clients, leads }) {
  const wonLeadsByStatus = useMemo(() => {
    return leads.filter(l => l.status === 'won').length;
  }, [leads]);

  return (
    <div className="animate-view-enter">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Converted agency retainers, plans, and renewals.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span><span className="font-bold text-emerald-700">{wonLeadsByStatus}</span> leads converted to won</span>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Building2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-600 text-base">No client accounts</p>
          <p className="text-sm text-slate-400 mt-1">Convert leads to client retainers to populate this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => {
            const plan = PLAN_STYLES[client.plan] || PLAN_STYLES.starter;
            const sts = STATUS_STYLES[client.status] || STATUS_STYLES.active;

            return (
              <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-250 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-indigo-700 transition-colors truncate">{client.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{client.slug}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${plan.bg} ${plan.text}`}>
                    {plan.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold capitalize flex items-center gap-1.5 ${sts.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sts.dot}`} />
                      {client.status}
                    </span>
                  </div>

                  {client.owner_email && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> Contact</span>
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">{client.owner_email}</span>
                    </div>
                  )}

                  {client.joined_at && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined</span>
                      <span className="font-medium text-slate-700">{client.joined_at}</span>
                    </div>
                  )}

                  {client.plan_renews_at && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Renews</span>
                      <span className="font-medium text-slate-700">{client.plan_renews_at}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

