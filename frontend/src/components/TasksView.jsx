import React, { useState, useMemo } from 'react';
import { CheckCircle2, Clock, Plus, AlertTriangle, X, Edit2, Trash2 } from 'lucide-react';

const PRIORITY_STYLES = {
  urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  high: 'bg-amber-100 text-amber-800 border-amber-200',
  medium: 'bg-slate-100 text-slate-600 border-slate-200',
  low: 'bg-slate-50 text-slate-500 border-slate-100',
};

export default function TasksView({
  tasks,
  leads,
  onCompleteTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onOpenLead,
  currentUser
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';
  const isSalesRep = currentUser?.role === 'sales_rep';
  const canCreateTask = !isViewer;

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    lead_id: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    task_type: 'follow_up',
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    task_type: 'follow_up',
    status: 'pending',
  });

  const leadMap = useMemo(() => Object.fromEntries(leads.map(l => [l.id, l])), [leads]);
  const today = new Date().toISOString().split('T')[0];

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (prio[a.priority] || 2) - (prio[b.priority] || 2);
    });
  }, [tasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreateTask({ ...createForm, lead_id: parseInt(createForm.lead_id) });
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        lead_id: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        task_type: 'follow_up',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium',
      task_type: task.task_type || 'follow_up',
      status: task.status || 'pending',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setSubmitting(true);
    try {
      await onUpdateTask(editingTask.id, editForm);
      setEditingTask(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    await onDeleteTask(taskId);
  };

  return (
    <div className="animate-view-enter">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500">Action items and scheduled follow-ups across all agency leads.</p>
        {canCreateTask && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            Schedule Task
          </button>
        )}
      </div>

      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-600 text-base">No tasks registered</p>
          <p className="text-sm text-slate-400 mt-1">Schedule a follow-up task to begin tracking execution.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {sortedTasks.map(task => {
            const isDone = task.status === 'done';
            const isOverdue = !isDone && task.due_date && task.due_date < today;
            const lead = leadMap[task.lead_id];
            const canCompleteThis = !isViewer && (isAdmin || (isSalesRep && task.assigned_to === currentUser?.id));
            const canEditThis = !isViewer && (isAdmin || (isSalesRep && task.assigned_to === currentUser?.id));
            const canDeleteThis = isAdmin;

            return (
              <div key={task.id} className={`px-5 py-4 flex items-center gap-4 transition-all duration-200 ${isDone ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                {/* Complete Toggle */}
                {canCompleteThis ? (
                  <button
                    onClick={() => !isDone && onCompleteTask(task.id)}
                    disabled={isDone}
                    className={`rounded-xl p-2 transition-all duration-200 flex-shrink-0 ${
                      isDone
                        ? 'text-emerald-500 bg-emerald-50 cursor-default'
                        : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 active:scale-90'
                    }`}
                    title={isDone ? 'Completed' : 'Mark done'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <div
                    className={`rounded-xl p-2 flex-shrink-0 ${
                      isDone ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${PRIORITY_STYLES[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                      {task.task_type.replace('_', ' ')}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.due_date || 'No due date'}
                    </span>
                    {lead && (
                      <button
                        onClick={() => onOpenLead(lead)}
                        className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg transition-colors duration-150"
                      >
                        {lead.instagram_handle}
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isDone ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      Done
                    </span>
                  ) : canCompleteThis ? (
                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all duration-150 active:scale-95"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                      Pending
                    </span>
                  )}
                  {canEditThis && (
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDeleteThis && (
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setEditingTask(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Edit Task</h2>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Task Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.due_date}
                    onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingTask(null)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.97]">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Schedule Follow-up Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assign to Lead *</label>
                <select value={createForm.lead_id} onChange={e => setCreateForm({ ...createForm, lead_id: e.target.value })} required
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-white">
                  <option value="">— Select lead —</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.instagram_handle} {l.full_name ? `(${l.full_name})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Task Title *</label>
                <input type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} required placeholder="Send pricing brochure"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                  <input type="date" value={createForm.due_date} onChange={e => setCreateForm({ ...createForm, due_date: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select value={createForm.priority} onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                  <select value={createForm.task_type} onChange={e => setCreateForm({ ...createForm, task_type: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-white">
                    <option value="follow_up">Follow Up</option>
                    <option value="call">Call</option>
                    <option value="proposal">Proposal</option>
                    <option value="check_in">Check-in</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea rows="2" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-slate-50/50" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.97]">
                  {submitting ? 'Scheduling...' : 'Schedule Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
