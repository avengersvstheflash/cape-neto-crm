import React, { useState, useMemo } from 'react';
import { Search, Plus, Phone, Mail, Instagram, X, Target } from 'lucide-react';

const STATUS_STYLES = {
  active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function LeadsView({ leads, onOpenLead, onCreateLead, onUpdateStatus }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    instagram_handle: '', full_name: '', phone: '', email: '',
    deal_value: '', notes: '', status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

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
        ...form,
        deal_value: form.deal_value ? parseFloat(form.deal_value) : null,
      });
      setShowModal(false);
      setForm({ instagram_handle: '', full_name: '', phone: '', email: '', deal_value: '', notes: '', status: 'active' });
    } finally {
      setSubmitting(false);
    }
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
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>
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
          {filtered.map(lead => (
            <div
              key={lead.id}
              onClick={() => onOpenLead(lead)}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-250 group flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-bold text-indigo-600 text-[15px] group-hover:text-indigo-700 transition-colors truncate">
                    {lead.instagram_handle}
                  </p>
                  {lead.full_name && (
                    <p className="text-sm font-medium text-slate-600 truncate">{lead.full_name}</p>
                  )}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize border whitespace-nowrap ${STATUS_STYLES[lead.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {lead.status}
                </span>
              </div>

              {lead.deal_value && (
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Deal: <span className="text-emerald-600 font-bold">ZAR {Number(lead.deal_value).toLocaleString()}</span>
                </p>
              )}

              <div className="mt-3 space-y-1.5 text-xs text-slate-500 flex-1">
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-slate-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Lead Modal */}
      {showModal && (
        <ModalBackdrop onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-modal-enter">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Instagram className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">New Instagram Lead</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Field label="Instagram Handle *" placeholder="@brand_or_creator" value={form.instagram_handle} onChange={v => setForm({ ...form, instagram_handle: v })} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
                <Field label="Phone" placeholder="+27 82 123 4567" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                <Field label="Est. Value (ZAR)" type="number" placeholder="25000" value={form.deal_value} onChange={v => setForm({ ...form, deal_value: v })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                <textarea rows="2" placeholder="Context from DM conversation..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all bg-slate-50/50" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.97]">
                  {submitting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all bg-slate-50/50" />
    </div>
  );
}

function ModalBackdrop({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

