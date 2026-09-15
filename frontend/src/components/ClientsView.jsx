import React, { useState, useMemo } from 'react';
import { Building2, Calendar, Mail, TrendingUp, Plus, Edit2, Trash2, X } from 'lucide-react';

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

export default function ClientsView({
  clients = [],
  leads = [],
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  currentUser
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    owner_email: '',
    plan: 'starter',
    status: 'active',
    plan_renews_at: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    owner_email: '',
    plan: 'starter',
    status: 'active',
    plan_renews_at: '',
  });

  const wonLeadsByStatus = useMemo(() => {
    return leads.filter(l => l.status === 'won').length;
  }, [leads]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const slug = createForm.slug || createForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await onCreateClient({
        ...createForm,
        slug,
        plan_renews_at: createForm.plan_renews_at || null,
      });
      setShowCreateModal(false);
      setCreateForm({ name: '', slug: '', owner_email: '', plan: 'starter', status: 'active', plan_renews_at: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (c) => {
    setEditingClient(c);
    setEditForm({
      name: c.name || '',
      owner_email: c.owner_email || '',
      plan: c.plan || 'starter',
      status: c.status || 'active',
      plan_renews_at: c.plan_renews_at || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingClient) return;
    setSubmitting(true);
    try {
      await onUpdateClient(editingClient.id, {
        ...editForm,
        plan_renews_at: editForm.plan_renews_at || null,
      });
      setEditingClient(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client account?')) return;
    await onDeleteClient(clientId);
  };

  // Strict RBAC: only admins can mutate client contracts
  const canMutate = currentUser?.role === 'admin';

  return (
    <div className="animate-view-enter">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Converted agency retainers, plans, and subscription renewal cycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span><span className="font-bold text-emerald-700">{wonLeadsByStatus}</span> leads converted</span>
          </div>
          {canMutate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              New Client Account
            </button>
          )}
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Building2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-600 text-base">No client accounts</p>
          <p className="text-sm text-slate-400 mt-1">Convert leads to client retainers or register a new client above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => {
            const plan = PLAN_STYLES[client.plan] || PLAN_STYLES.starter;
            const sts = STATUS_STYLES[client.status] || STATUS_STYLES.active;

            return (
              <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-250 group flex flex-col justify-between">
                <div>
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
                        <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Contact</span>
                        <span className="font-medium text-slate-700 truncate max-w-[180px]">{client.owner_email}</span>
                      </div>
                    )}

                    {client.plan_renews_at && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Renews</span>
                        <span className="font-medium text-slate-700">{client.plan_renews_at}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                {canMutate && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleStartEdit(client)}
                      className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition-colors"
                      title="Edit Client"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">New Client Retainer Account</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Media Group"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Plan Tier</label>
                  <select
                    value={createForm.plan}
                    onChange={e => setCreateForm({ ...createForm, plan: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={createForm.status}
                    onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="paused">Paused</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Email Contact</label>
                <input
                  type="email"
                  placeholder="contact@brand.co.za"
                  value={createForm.owner_email}
                  onChange={e => setCreateForm({ ...createForm, owner_email: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Renewal Date</label>
                <input
                  type="date"
                  value={createForm.plan_renews_at}
                  onChange={e => setCreateForm({ ...createForm, plan_renews_at: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl font-semibold shadow-md">
                  {submitting ? 'Saving...' : 'Register Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={() => setEditingClient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Edit Client Account</h2>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Plan Tier</label>
                  <select
                    value={editForm.plan}
                    onChange={e => setEditForm({ ...editForm, plan: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="paused">Paused</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Email Contact</label>
                <input
                  type="email"
                  value={editForm.owner_email}
                  onChange={e => setEditForm({ ...editForm, owner_email: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Renewal Date</label>
                <input
                  type="date"
                  value={editForm.plan_renews_at}
                  onChange={e => setEditForm({ ...editForm, plan_renews_at: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingClient(null)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
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