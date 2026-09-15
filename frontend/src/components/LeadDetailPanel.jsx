import React, { useState, useEffect } from 'react';
import {
  X, Instagram, Phone, Mail, Clock, CheckCircle2, Plus, Activity,
  Target, AlertTriangle, Edit2, Trash2, Save
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

export default function LeadDetailPanel({ lead, stages = [], onClose, onRefresh, addToast }) {
export default function LeadDetailPanel({ lead, stages = [], onClose, onRefresh, addToast, currentUser }) {
  const [visible, setVisible] = useState(false);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [linkedActivities, setLinkedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';
  const isSalesRep = currentUser?.role === 'sales_rep';

  const canEditLead = !isViewer && (isAdmin || (isSalesRep && lead?.assigned_to === currentUser?.id));
  const canDeleteLead = isAdmin;
  const canCreateTask = !isViewer && (isAdmin || (isSalesRep && lead?.assigned_to === currentUser?.id));
  const canCreateActivity = !isViewer && (isAdmin || (isSalesRep && lead?.assigned_to === currentUser?.id));

  // Edit Lead State
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [leadEditForm, setLeadEditForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    deal_value: '',
    status: 'active',
    notes: '',
    stage_id: '',
  });

  // Activity States
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ action_type: 'message_sent', description: '' });
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editActivityText, setEditActivityText] = useState('');

  // Task States
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    task_type: 'follow_up',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskEditForm, setTaskEditForm] = useState({ title: '', priority: 'medium', due_date: '' });

  const [submitting, setSubmitting] = useState(false);

  // Animate entrance
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Sync lead info into edit form
  useEffect(() => {
    if (lead) {
      setLeadEditForm({
        full_name: lead.full_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        deal_value: lead.deal_value || '',
        status: lead.status || 'active',
        notes: lead.notes || '',
        stage_id: lead.stage_id || '',
      });
    }
  }, [lead]);

  // Fetch linked data
  const loadLinkedData = async () => {
    if (!lead?.id) return;
    setLoading(true);
    try {
      const [tasks, activities] = await Promise.all([
        api.fetchTasks({ lead_id: lead.id, limit: 100 }),
        api.fetchActivities({ lead_id: lead.id, limit: 100 }),
      ]);
      setLinkedTasks(tasks || []);
      setLinkedActivities(activities || []);
    } catch {
      setLinkedTasks([]);
      setLinkedActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinkedData();
  }, [lead?.id]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // ── Lead Operations ──
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateLead(lead.id, {
        ...leadEditForm,
        deal_value: leadEditForm.deal_value ? parseFloat(leadEditForm.deal_value) : null,
        stage_id: leadEditForm.stage_id ? parseInt(leadEditForm.stage_id) : null,
      });
      addToast('Lead details updated!');
      setIsEditingLead(false);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm(`Are you sure you want to delete lead ${lead.instagram_handle}? This action is irreversible.`)) return;
    try {
      await api.deleteLead(lead.id);
      addToast('Lead deleted successfully');
      onRefresh();
      handleClose();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ── Task Operations ──
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTask({ ...taskForm, lead_id: lead.id });
      setTaskForm({ title: '', description: '', due_date: new Date().toISOString().split('T')[0], priority: 'medium', task_type: 'follow_up' });
      setShowTaskForm(false);
      addToast('Task created!');
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.completeTask(taskId);
      addToast('Task marked completed!');
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveTaskEdit = async (taskId) => {
    try {
      await api.updateTask(taskId, taskEditForm);
      setEditingTaskId(null);
      addToast('Task updated!');
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      addToast('Task deleted');
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ── Activity Operations ──
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
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveActivityEdit = async (actId) => {
    try {
      await api.updateActivity(actId, { description: editActivityText });
      setEditingActivityId(null);
      addToast('Activity updated');
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (!window.confirm('Delete this activity entry?')) return;
    try {
      await api.deleteActivity(actId);
      addToast('Activity deleted');
      loadLinkedData();
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
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

      {/* Slide-Over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[460px] max-w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0 bg-slate-50/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-indigo-600 truncate">{lead.instagram_handle}</span>
              <button
                onClick={() => setIsEditingLead(!isEditingLead)}
                title="Edit Lead Details"
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteLead}
                title="Delete Lead"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {canEditLead && (
                <button
                  onClick={() => setIsEditingLead(!isEditingLead)}
                  title="Edit Lead Details"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {canDeleteLead && (
                <button
                  onClick={handleDeleteLead}
                  title="Delete Lead"
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {lead.full_name && <p className="text-sm font-medium text-slate-600 mt-0.5">{lead.full_name}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${STATUS_STYLES[lead.status]}`}>
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

          {/* Edit Lead Form (Collapsible) */}
          {isEditingLead && (
            <form onSubmit={handleUpdateLead} className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-3 animate-view-enter">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">Edit Lead Details</span>
                <button type="button" onClick={() => setIsEditingLead(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <input type="text" value={leadEditForm.full_name} onChange={e => setLeadEditForm({ ...leadEditForm, full_name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                  <input type="text" value={leadEditForm.phone} onChange={e => setLeadEditForm({ ...leadEditForm, phone: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Email</label>
                  <input type="email" value={leadEditForm.email} onChange={e => setLeadEditForm({ ...leadEditForm, email: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Deal Value (ZAR)</label>
                  <input type="number" value={leadEditForm.deal_value} onChange={e => setLeadEditForm({ ...leadEditForm, deal_value: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select value={leadEditForm.status} onChange={e => setLeadEditForm({ ...leadEditForm, status: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
                    <option value="active">Active</option>
                    <option value="won">Won</option>
                    <option value="paused">Paused</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Pipeline Stage</label>
                  <select value={leadEditForm.stage_id} onChange={e => setLeadEditForm({ ...leadEditForm, stage_id: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
                    <option value="">— Unassigned —</option>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Notes</label>
                <textarea rows="2" value={leadEditForm.notes} onChange={e => setLeadEditForm({ ...leadEditForm, notes: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full text-xs font-semibold py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                {submitting ? 'Saving...' : 'Save Lead Details'}
              </button>
            </form>
          )}

          {/* Contact Details Card */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2 text-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Information</h4>
            {lead.phone && <p className="flex items-center gap-2 text-slate-600 text-xs"><Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}</p>}
            {lead.email && <p className="flex items-center gap-2 text-slate-600 text-xs"><Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}</p>}
            <p className="flex items-center gap-2 text-slate-600 text-xs"><Instagram className="w-3.5 h-3.5 text-slate-400" /> {lead.source || 'Instagram'}</p>
            {lead.notes && <p className="text-xs italic text-slate-600 bg-white rounded-xl p-2.5 border border-slate-100 mt-2">"{lead.notes}"</p>}
          </div>

          {/* ── Linked Tasks ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tasks ({linkedTasks.length})
              </h4>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Schedule Task
              </button>
              {canCreateTask && (
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Schedule Task
                </button>
              )}
            </div>

            {/* Quick Task Creation */}
            {showTaskForm && (
            {canCreateTask && showTaskForm && (
              <form onSubmit={handleCreateTask} className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-3 mb-3 space-y-2 animate-view-enter">
                <input
                  type="text"
                  placeholder="Task title..."
                  required
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                  />
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button type="button" onClick={() => setShowTaskForm(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2">Cancel</button>
                  <button type="submit" disabled={submitting} className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1 rounded-lg">Save</button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : linkedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center">No tasks currently linked.</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => {
                  const isEditingThis = editingTaskId === task.id;
                  const canCompleteThis = !isViewer && (isAdmin || (isSalesRep && task.assigned_to === currentUser?.id));
                  const canEditThis = !isViewer && (isAdmin || (isSalesRep && task.assigned_to === currentUser?.id));
                  const canDeleteThis = isAdmin;

                  return (
                    <div key={task.id} className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                      {isEditingThis ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={taskEditForm.title}
                            onChange={e => setTaskEditForm({ ...taskEditForm, title: e.target.value })}
                            className="w-full text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={taskEditForm.priority}
                              onChange={e => setTaskEditForm({ ...taskEditForm, priority: e.target.value })}
                              className="text-xs border border-slate-300 rounded px-2 py-0.5 bg-white"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingTaskId(null)} className="text-xs text-slate-400 px-2 py-0.5">Cancel</button>
                              <button onClick={() => handleSaveTaskEdit(task.id)} className="text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded font-semibold">Save</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <button onClick={() => handleCompleteTask(task.id)} className="text-slate-300 hover:text-indigo-600 transition-colors" title="Complete task">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            {canCompleteThis ? (
                              <button onClick={() => handleCompleteTask(task.id)} className="text-slate-300 hover:text-indigo-600 transition-colors" title="Complete task">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-slate-300">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-800 truncate">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {task.due_date && task.due_date < today && (
                              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Overdue</span>
                            )}
                            <button
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setTaskEditForm({ title: task.title, priority: task.priority, due_date: task.due_date || '' });
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {canEditThis && (
                              <button
                                onClick={() => {
                                  setEditingTaskId(task.id);
                                  setTaskEditForm({ title: task.title, priority: task.priority, due_date: task.due_date || '' });
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            {canDeleteThis && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {completedTasks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Completed ({completedTasks.length})</p>
                    {completedTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between py-1 px-2 text-xs text-slate-400">
                        <span className="line-through truncate">{task.title}</span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-rose-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-rose-500" title="Delete Task">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Linked Activities ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Activity History ({linkedActivities.length})
              </h4>
              <button
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Log Activity
              </button>
              {canCreateActivity && (
                <button
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Log Activity
                </button>
              )}
            </div>

            {/* Inline Activity Form */}
            {showActivityForm && (
            {canCreateActivity && showActivityForm && (
              <form onSubmit={handleLogActivity} className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-3 mb-3 space-y-2 animate-view-enter">
                <select
                  value={activityForm.action_type}
                  onChange={e => setActivityForm({ ...activityForm, action_type: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="message_sent">DM / Message Sent</option>
                  <option value="note_added">Call / Internal Note</option>
                  <option value="stage_change">Stage Change</option>
                  <option value="deal_created">Deal Proposal</option>
                </select>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe interaction..."
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                />
                <div className="flex justify-end gap-1.5">
                  <button type="button" onClick={() => setShowActivityForm(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2">Cancel</button>
                  <button type="submit" disabled={submitting} className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1 rounded-lg">Save</button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : linkedActivities.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center">No activity logged.</p>
            ) : (
              <div className="space-y-2">
                {linkedActivities.map(act => {
                  const isEditing = editingActivityId === act.id;
                  const canEditThis = !isViewer && (isAdmin || (isSalesRep && act.user_id === currentUser?.id));
                  const canDeleteThis = isAdmin;

                  return (
                    <div key={act.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-indigo-700 capitalize">{act.action_type.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{timeAgo(act.created_at)}</span>
                          <button
                            onClick={() => {
                              setEditingActivityId(act.id);
                              setEditActivityText(act.description || '');
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Activity"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Activity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {canEditThis && (
                            <button
                              onClick={() => {
                                setEditingActivityId(act.id);
                                setEditActivityText(act.description || '');
                              }}
                              className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit Activity"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {canDeleteThis && (
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="space-y-1.5 mt-1">
                          <textarea
                            rows="2"
                            value={editActivityText}
                            onChange={e => setEditActivityText(e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                          />
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setEditingActivityId(null)} className="text-[10px] text-slate-400 px-2">Cancel</button>
                            <button onClick={() => handleSaveActivityEdit(act.id)} className="text-[10px] bg-indigo-600 text-white px-2.5 py-0.5 rounded font-semibold">Save</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700">{act.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
