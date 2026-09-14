import React, { useState, useEffect } from 'react';
import {
  X, Instagram, Phone, Mail, Clock, CheckCircle2, Plus, Activity,
  Target, AlertTriangle, MessageSquare
} from 'lucide-react';
import * as api from '../api';

const STATUS_STYLES = {
  active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LeadDetailPanel({ lead, onClose, onRefresh, addToast }) {
  const [visible, setVisible] = useState(false);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [linkedActivities, setLinkedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityForm, setActivityForm] = useState({ action_type: 'message_sent', description: '' });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Animate entrance
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Fetch linked data when lead changes
  useEffect(() => {
    if (!lead) return;
    setLoading(true);
    Promise.all([
      api.fetchTasks({ lead_id: lead.id, limit: 50 }),
      api.fetchActivities({ lead_id: lead.id, limit: 50 }),
    ]).then(([tasks, activities]) => {
      setLinkedTasks(tasks || []);
      setLinkedActivities(activities || []);
    }).catch(() => {
      setLinkedTasks([]);
      setLinkedActivities([]);
    }).finally(() => setLoading(false));
  }, [lead?.id]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.completeTask(taskId);
      setLinkedTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'done', completed_at: new Date().toISOString() } : t
      ));
      addToast('Task completed!');
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createActivity({
        lead_id: lead.id,
        action_type: activityForm.action_type,
        description: activityForm.description,
      });
      setActivityForm({ action_type: 'message_sent', description: '' });
      setShowActivityForm(false);
      addToast('Activity logged!');
      // Refresh linked activities
      const acts = await api.fetchActivities({ lead_id: lead.id, limit: 50 });
      setLinkedActivities(acts || []);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!lead) return null;

  const today = new Date().toISOString().split('T')[0];
  const pendingTasks = linkedTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  const completedTasks = linkedTasks.filter(t => t.status === 'done');

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[440px] max-w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div className="min-w-0">
            <p className="text-lg font-bold text-indigo-600 truncate">{lead.instagram_handle}</p>
            {lead.full_name && <p className="text-sm font-medium text-slate-600 mt-0.5">{lead.full_name}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize border ${STATUS_STYLES[lead.status]}`}>
                {lead.status}
              </span>
              {lead.deal_value && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ZAR {Number(lead.deal_value).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact</h4>
            <div className="space-y-1.5 text-sm">
              {lead.phone && (
                <p className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}</p>
              )}
              {lead.email && (
                <p className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}</p>
              )}
              <p className="flex items-center gap-2 text-slate-600"><Instagram className="w-3.5 h-3.5 text-slate-400" /> {lead.source || 'instagram'}</p>
            </div>
            {lead.notes && (
              <p className="text-xs italic text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 mt-2">
                "{lead.notes}"
              </p>
            )}
          </div>

          {/* Linked Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tasks ({linkedTasks.length})
              </h4>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : linkedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center">No tasks linked to this lead.</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.due_date || 'No date'}
                        </span>
                        {task.due_date && task.due_date < today && (
                          <span className="text-[10px] text-rose-600 flex items-center gap-0.5 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {completedTasks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Completed ({completedTasks.length})</p>
                    {completedTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-3 py-1.5 px-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-slate-400 line-through truncate">{task.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Activity Timeline ({linkedActivities.length})
              </h4>
              <button
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Log Activity
              </button>
            </div>

            {/* Inline Activity Form */}
            {showActivityForm && (
              <form onSubmit={handleLogActivity} className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-3 mb-3 space-y-2 animate-modal-enter">
                <select
                  value={activityForm.action_type}
                  onChange={e => setActivityForm({ ...activityForm, action_type: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="message_sent">DM / Message Sent</option>
                  <option value="note_added">Call / Internal Note</option>
                  <option value="stage_change">Stage Change</option>
                  <option value="deal_created">Deal Proposal</option>
                </select>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe the interaction..."
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <div className="flex justify-end gap-1.5">
                  <button type="button" onClick={() => setShowActivityForm(false)} className="text-xs text-slate-500 px-3 py-1 rounded-lg hover:bg-white transition-all">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-indigo-700 transition-all active:scale-95">
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : linkedActivities.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center">No activity recorded for this lead.</p>
            ) : (
              <div className="space-y-1">
                {linkedActivities.map(act => (
                  <div key={act.id} className="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-700 capitalize">{act.action_type.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-slate-400">{timeAgo(act.created_at)}</span>
                      </div>
                      {act.description && (
                        <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

