import React, { useState, useMemo } from 'react';
import { Search, Plus, Phone, Mail, Instagram, X, Target, Edit2, Trash2 } from 'lucide-react';

const STATUS_STYLES = {
  active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function LeadsView({
  leads,
  stages = [],
  onOpenLead,
  onCreateLead,
  onUpdateLead,
  onDeleteLead,
  onUpdateStatus,
  currentUser
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';
  const isSalesRep = currentUser?.role === 'sales_rep';
  const canCreateLead = !isViewer;

  // Forms
  const [createForm, setCreateForm] = useState({
    instagram_handle: '',
    full_name: '',
    phone: '',
    email: '',
    deal_value: '',
    notes: '',
    status: 'active',
    stage_id: '',
  });

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    deal_value: '',
    notes: '',
    status: 'active',
    stage_id: '',
  });

  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s.name])), [stages]);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchStatus = filter === 'all' || l.status === filter;
      const matchSearch = !search ||
        (l.instagram_handle || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.full_name || '').toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [leads, filter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreateLead({
        ...createForm,
        deal_value: createForm.deal_value ? parseFloat(createForm.deal_value) : null,
        stage_id: createForm.stage_id ? parseInt(createForm.stage_id) : null,
      });
      setShowCreateModal(false);
      setCreateForm({
        instagram_handle: '',
        full_name: '',
        phone: '',
        email: '',
        deal_value: '',
        notes: '',
        status: 'active',
        stage_id: '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (e, lead) => {
    e.stopPropagation();
    setEditingLead(lead);
    setEditForm({
      full_name: lead.full_name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      deal_value: lead.deal_value || '',
      notes: lead.notes || '',
      status: lead.status || 'active',
      stage_id: lead.stage_id || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLead) return;
    setSubmitting(true);
    try {
      await onUpdateLead(editingLead.id, {
        ...editForm,
        deal_value: editForm.deal_value ? parseFloat(editForm.deal_value) : null,
        stage_id: editForm.stage_id ? parseInt(editForm.stage_id) : null,
      });
      setEditingLead(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e, leadId, handle) => {
    e.stopPropagation();
    if (!window.confirm(`Delete lead ${handle}? This will remove associated tasks and activity records.`)) return;
    await onDeleteLead(leadId);
  };

  return (
    <div className="animate-view-enter">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search handle or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-56 bg-white transition-all duration-200"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-medium text-slate-500">
            {['all', 'active', 'won', 'lost', 'paused'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                  filter === s
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {canCreateLead && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        )}
      </div>

      {/* Lead Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Target className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-600 text-base">No leads found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new lead.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lead => {
            const canEditThis = !isViewer && (isAdmin || (isSalesRep && lead.assigned_to === currentUser?.id));
            const canDeleteThis = isAdmin;
            const canChangeStatus = !isViewer && (isAdmin || (isSalesRep && lead.assigned_to === currentUser?.id));

            return (
              <div
                key={lead.id}
                onClick={() => onOpenLead(lead)}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-250 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-indigo-600 text-[15px] group-hover:text-indigo-700 transition-colors truncate">
                        {lead.instagram_handle}
                      </p>
                      {lead.full_name && (
                        <p className="text-sm font-medium text-slate-600 truncate">{lead.full_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize border whitespace-nowrap ${STATUS_STYLES[lead.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {lead.status}
                      </span>
                      {canEditThis && (
                        <button
                          onClick={(e) => handleStartEdit(e, lead)}
                          className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDeleteThis && (
                        <button
                          onClick={(e) => handleDelete(e, lead.id, lead.instagram_handle)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {lead.stage_id && stageMap[lead.stage_id] && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {stageMap[lead.stage_id]}
                    </span>
                  )}

                  {lead.deal_value && (
                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      Deal: <span className="text-emerald-600 font-bold">ZAR {Number(lead.deal_value).toLocaleString()}</span>
                    </p>
                  )}

                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                    {lead.phone && (
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {lead.phone}</p>
                    )}
                    {lead.email && (
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {lead.email}</p>
                    )}
                    {lead.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg px-2.5 py-1.5 mt-2 line-clamp-2 border border-slate-100">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] text-slate-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  {canChangeStatus ? (
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                      className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="won">Won</option>
                      <option value="paused">Paused</option>
                      <option value="lost">Lost</option>
                    </select>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 capitalize px-2 py-1">
                      {lead.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Instagram className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">New Instagram Lead</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Instagram Handle *</label>
                <input
                  type="text"
                  placeholder="@brand_or_creator"
                  required
                  value={createForm.instagram_handle}
                  onChange={e => setCreateForm({ ...createForm, instagram_handle: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={createForm.full_name}
                    onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+27 82 123 4567"
                    value={createForm.phone}
                    onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Estimated Value (ZAR)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={createForm.deal_value}
                    onChange={e => setCreateForm({ ...createForm, deal_value: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pipeline Stage</label>
                <select
                  value={createForm.stage_id}
                  onChange={e => setCreateForm({ ...createForm, stage_id: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="">— Unassigned —</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                <textarea
                  rows="2"
                  placeholder="Context from DM conversation..."
                  value={createForm.notes}
                  onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.97]">
                  {submitting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setEditingLead(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Edit Lead ({editingLead.instagram_handle})</h2>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Estimated Value (ZAR)</label>
                  <input
                    type="number"
                    value={editForm.deal_value}
                    onChange={e => setEditForm({ ...editForm, deal_value: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="won">Won</option>
                    <option value="paused">Paused</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pipeline Stage</label>
                  <select
                    value={editForm.stage_id}
                    onChange={e => setEditForm({ ...editForm, stage_id: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                  >
                    <option value="">— Unassigned —</option>
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl font-semibold shadow-md">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
