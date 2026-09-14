import React, { useMemo } from 'react';
import { Activity, Target, MessageSquare, CheckCircle2, FileText, Zap, ArrowUpRight } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_CONFIG = {
  stage_change: { icon: ArrowUpRight, color: 'bg-violet-50 text-violet-600', label: 'Stage Change' },
  task_created: { icon: FileText, color: 'bg-blue-50 text-blue-600', label: 'Task Created' },
  task_completed: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', label: 'Task Completed' },
  note_added: { icon: FileText, color: 'bg-slate-50 text-slate-600', label: 'Note Added' },
  deal_created: { icon: Zap, color: 'bg-amber-50 text-amber-600', label: 'Deal Created' },
  message_sent: { icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600', label: 'DM Sent' },
  status_change: { icon: Target, color: 'bg-sky-50 text-sky-600', label: 'Status Change' },
};

const DEFAULT_CONFIG = { icon: Activity, color: 'bg-slate-50 text-slate-600', label: 'Activity' };

export default function ActivityView({ activities, leads, onOpenLead }) {
  const leadMap = useMemo(() => Object.fromEntries(leads.map(l => [l.id, l])), [leads]);

  return (
    <div className="animate-view-enter">
      <div className="mb-5">
        <p className="text-sm text-slate-500">Chronological audit trail of all agency interactions across leads.</p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Activity className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-600 text-base">No activity logged yet</p>
          <p className="text-sm text-slate-400 mt-1">Interactions with leads will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Timeline */}
          <div className="relative">
            {activities.map((act, idx) => {
              const config = ACTION_CONFIG[act.action_type] || DEFAULT_CONFIG;
              const Icon = config.icon;
              const lead = leadMap[act.lead_id];
              const isLast = idx === activities.length - 1;

              return (
                <div key={act.id} className="relative flex gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors duration-150">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[33px] top-[52px] bottom-0 w-px bg-slate-100" />
                  )}

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 z-10`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {config.label}
                      </span>
                      {lead && (
                        <button
                          onClick={() => onOpenLead(lead)}
                          className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg transition-colors duration-150 flex items-center gap-1"
                        >
                          <Target className="w-3 h-3" />
                          {lead.instagram_handle}
                        </button>
                      )}
                      <span className="text-[11px] text-slate-400 ml-auto whitespace-nowrap">{timeAgo(act.created_at)}</span>
                    </div>
                    {act.description && (
                      <p className="text-sm text-slate-600 mt-1">{act.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

