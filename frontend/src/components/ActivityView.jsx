import React, { useState, useMemo } from 'react';
import { Activity, Target, MessageSquare, CheckCircle2, FileText, Zap, ArrowUpRight, Edit2, Trash2, X } from 'lucide-react';

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

export default function ActivityView({ activities, leads, onOpenLead, onUpdateActivity, onDeleteActivity, currentUser }) {
  const [editingActivity, setEditingActivity] = useState(null);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';

  const leadMap = useMemo(() => Object.fromEntries(leads.map(l => [l.id, l])), [leads]);

  const handleStartEdit = (act) => {
    setEditingActivity(act);
    setEditText(act.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingActivity) return;
    setSubmitting(true);
    try {
      await onUpdateActivity(editingActivity.id, { description: editText });
      setEditingActivity(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (actId) => {
    if (!window.confirm('Are you sure you want to delete this activity log?')) return;
    await onDeleteActivity(actId);
  };

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
          <div className="relative">
            {activities.map((act, idx) => {
              const config = ACTION_CONFIG[act.action_type] || DEFAULT_CONFIG;
              const Icon = config.icon;
              const lead = leadMap[act.lead_id];
              const isLast = idx === activities.length - 1;
              const canEditThis = !isViewer && (isAdmin || (currentUser?.role === 'sales_rep' && act.user_id === currentUser?.id));
              const canDeleteThis = isAdmin;

              return (
                <div key={act.id} className="relative flex gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors duration-150 group">
                  {!isLast && (
                    <div className="absolute left-[33px] top-[52px] bottom-0 w-px bg-slate-100" />
                  )}

                  <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 z-10`}>
                    <Icon className="w-4 h-4" />
                  </div>

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
                      {canEditThis && (
                        <button
                          onClick={() => handleStartEdit(act)}
                          className="p-1 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                          title="Edit Description"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDeleteThis && (
                        <button
                          onClick={() => handleDelete(act.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setEditingActivity(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Edit Activity Log</h2>
              <button onClick={() => setEditingActivity(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description / Summary</label>
                <textarea
                  rows="3"
                  required
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingActivity(null)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl font-semibold shadow-md">
                  {submitting ? 'Saving...' : 'Update Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
