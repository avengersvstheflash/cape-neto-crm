import React, { useState, useEffect } from 'react';
import { 
  Users, CheckSquare, Briefcase, Activity, Plus, Search, 
  LogOut, CheckCircle2, Clock, AlertCircle, RefreshCw, 
  Instagram, Phone, Mail, Building, ArrowRight, Shield
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('cape_neto_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'tasks', 'clients', 'activities'
  
  // Data state
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters & modals
  const [leadFilter, setLeadFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState(null);

  // Form states
  const [newLead, setNewLead] = useState({
    instagram_handle: '',
    full_name: '',
    phone: '',
    email: '',
    deal_value: '',
    notes: '',
    status: 'active'
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    lead_id: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    task_type: 'follow_up'
  });

  const [newActivity, setNewActivity] = useState({
    action_type: 'message_sent',
    description: ''
  });

  // Login Form
  const [loginEmail, setLoginEmail] = useState('admin@capeneto.com');
  const [loginPassword, setLoginPassword] = useState('admin123');

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Check login & fetch initial data
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchAllData();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, tasksRes, clientsRes, actRes] = await Promise.all([
        fetch(`${API_BASE}/leads/`, { headers: authHeaders }),
        fetch(`${API_BASE}/tasks/`, { headers: authHeaders }),
        fetch(`${API_BASE}/clients/`, { headers: authHeaders }),
        fetch(`${API_BASE}/activities/`, { headers: authHeaders })
      ]);

      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (actRes.ok) setActivities(await actRes.json());
    } catch (err) {
      setError('Cannot connect to backend server at ' + API_BASE + '. Please ensure FastAPI is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    const email = customEmail || loginEmail;
    const password = customPass || loginPassword;

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.detail || 'Invalid login credentials');
        return;
      }

      const data = await res.json();
      localStorage.setItem('cape_neto_token', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      alert('Network error connecting to ' + API_BASE);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cape_neto_token');
    setToken('');
    setCurrentUser(null);
  };

  // Quick Lead Actions
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLead,
        deal_value: newLead.deal_value ? parseFloat(newLead.deal_value) : null
      };

      const res = await fetch(`${API_BASE}/leads/`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowNewLeadModal(false);
        setNewLead({
          instagram_handle: '',
          full_name: '',
          phone: '',
          email: '',
          deal_value: '',
          notes: '',
          status: 'active'
        });
        showNotification('Lead successfully added!');
        fetchAllData();
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to create lead');
      }
    } catch (err) {
      alert('Error creating lead');
    }
  };

  const handleStatusChange = async (leadId, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        showNotification(`Lead updated to ${nextStatus}`);
        fetchAllData();
      }
    } catch (err) {
      alert('Error updating lead status');
    }
  };

  // Task Actions
  const handleCompleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: authHeaders
      });

      if (res.ok) {
        showNotification('Task marked completed!');
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.detail || 'Could not complete task');
      }
    } catch (err) {
      alert('Error completing task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...newTask,
          lead_id: parseInt(newTask.lead_id)
        })
      });

      if (res.ok) {
        setShowNewTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          lead_id: '',
          due_date: new Date().toISOString().split('T')[0],
          priority: 'medium',
          task_type: 'follow_up'
        });
        showNotification('Task successfully scheduled!');
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create task');
      }
    } catch (err) {
      alert('Error creating task');
    }
  };

  // Activity Actions
  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!selectedLeadForActivity) return;
    try {
      const res = await fetch(`${API_BASE}/activities/`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          lead_id: selectedLeadForActivity.id,
          action_type: newActivity.action_type,
          description: newActivity.description
        })
      });

      if (res.ok) {
        setShowActivityModal(false);
        setSelectedLeadForActivity(null);
        setNewActivity({ action_type: 'message_sent', description: '' });
        showNotification('Activity logged to lead timeline!');
        fetchAllData();
      }
    } catch (err) {
      alert('Error logging activity');
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesStatus = leadFilter === 'all' || l.status === leadFilter;
    const matchesSearch = !searchTerm || 
      (l.instagram_handle && l.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.full_name && l.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const activeLeadsCount = leads.filter(l => l.status === 'active').length;
  const wonLeadsCount = leads.filter(l => l.status === 'won').length;

  // ────────────────── LOGIN VIEW ──────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200">
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl mb-4 mx-auto">
            <Instagram className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900">Cape Neto CRM</h1>
          <p className="text-slate-500 text-sm text-center mb-6">
            Instagram-Native Agency CRM Engine
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Agency Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition shadow-md"
            >
              Sign In to Workspace
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogin(null, 'admin@capeneto.com', 'admin123')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg font-medium transition text-center"
              >
                👤 Admin User
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'sarah.rep@capeneto.com', 'rep123')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg font-medium transition text-center"
              >
                💼 Sales Rep
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────── MAIN DASHBOARD VIEW ──────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Notification Toast */}
      {notice && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {notice}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              CN
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">Cape Neto CRM</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Agency Prototype
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllData}
              title="Refresh Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            
            {currentUser && (
              <div className="flex items-center gap-2 text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-slate-700">{currentUser.email}</span>
                <span className="text-xs uppercase bg-white border border-slate-300 font-semibold px-1.5 py-0.5 rounded text-slate-600">
                  {currentUser.role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header / Metrics Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Total Leads</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{leads.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-500/30" />
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Active Inbound</p>
              <p className="text-2xl font-bold text-indigo-600 mt-0.5">{activeLeadsCount}</p>
            </div>
            <Instagram className="w-8 h-8 text-indigo-500/30" />
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Tasks Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{pendingTasks.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-amber-500/30" />
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Clients & Won</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{wonLeadsCount + clients.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-emerald-500/30" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'leads'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Instagram className="w-4 h-4" />
            Leads & Pipeline ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Task Queue ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'clients'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            Client Accounts ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'activities'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Activity Log ({activities.length})
          </button>
        </div>

        {/* ─── TAB 1: LEADS & PIPELINE ─── */}
        {activeTab === 'leads' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search handle or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
                  />
                </div>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 text-xs font-medium text-slate-600">
                  {['all', 'active', 'won', 'lost', 'paused'].map(status => (
                    <button
                      key={status}
                      onClick={() => setLeadFilter(status)}
                      className={`px-3 py-1 rounded-md capitalize transition ${
                        leadFilter === status ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowNewLeadModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add New Lead
              </button>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <Instagram className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-700">No leads found</p>
                <p className="text-sm mt-1">Try changing filters or add a new lead above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                            <span className="text-indigo-600 font-semibold">{lead.instagram_handle}</span>
                          </div>
                          {lead.full_name && (
                            <p className="text-sm font-medium text-slate-600">{lead.full_name}</p>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                          lead.status === 'active' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          lead.status === 'won' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          lead.status === 'lost' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {lead.status}
                        </span>
                      </div>

                      {lead.deal_value && (
                        <p className="text-xs font-semibold text-slate-700 mt-1">
                          Estimated Deal: <span className="text-emerald-600 font-bold">ZAR {Number(lead.deal_value).toLocaleString()}</span>
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-xs text-slate-500">
                        {lead.phone && (
                          <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}</p>
                        )}
                        {lead.email && (
                          <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}</p>
                        )}
                        {lead.notes && (
                          <p className="text-xs bg-slate-50 p-2 rounded text-slate-600 italic mt-2 border border-slate-100">
                            "{lead.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setSelectedLeadForActivity(lead);
                          setShowActivityModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
                      >
                        <Activity className="w-3 h-3" /> Log Activity
                      </button>

                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-xs font-medium border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="won">Won / Converted</option>
                        <option value="paused">Paused</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: TASKS QUEUE ─── */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm text-slate-500">
                Action items and follow-ups requiring agency sales attention.
              </p>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Schedule Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-700">No tasks currently registered</p>
                <p className="text-sm mt-1">Schedule a task against a lead to begin tracking.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
                {tasks.map(task => {
                  const isDone = task.status === 'done';
                  const isOverdue = !isDone && task.due_date && new Date(task.due_date) < new Date().setHours(0,0,0,0);

                  return (
                    <div key={task.id} className={`p-4 flex items-center justify-between gap-4 ${isDone ? 'bg-slate-50/70' : 'hover:bg-slate-50/50'}`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => !isDone && handleCompleteTask(task.id)}
                          disabled={isDone}
                          className={`mt-0.5 rounded-lg p-1.5 transition ${
                            isDone 
                              ? 'text-emerald-600 bg-emerald-50 cursor-default' 
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-300'
                          }`}
                          title={isDone ? 'Completed' : 'Click to complete'}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                              task.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                              task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
                            {isOverdue && (
                              <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded border border-rose-200">
                                Overdue
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Due: {task.due_date || 'No due date'}
                            </span>
                            <span>Type: {task.task_type}</span>
                            <span>Lead ID: #{task.lead_id}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: CLIENT ACCOUNTS ─── */}
        {activeTab === 'clients' && (
          <div>
            <div className="mb-5">
              <p className="text-sm text-slate-500">
                Converted agency client retainers, subscription tiers, and renewal dates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map(client => (
                <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{client.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">@{client.slug}</p>
                    </div>
                    <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {client.plan} Plan
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-semibold text-emerald-600 capitalize">{client.status}</span>
                    </p>
                    {client.owner_email && (
                      <p className="flex justify-between">
                        <span className="text-slate-400">Account Owner:</span>
                        <span className="font-medium text-slate-700">{client.owner_email}</span>
                      </p>
                    )}
                    {client.plan_renews_at && (
                      <p className="flex justify-between">
                        <span className="text-slate-400">Plan Renews:</span>
                        <span className="font-medium text-slate-700">{client.plan_renews_at}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: ACTIVITY LOG ─── */}
        {activeTab === 'activities' && (
          <div>
            <div className="mb-5">
              <p className="text-sm text-slate-500">
                Chronological audit timeline of agency conversations, stage advances, and deals.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
              {activities.map(act => (
                <div key={act.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {act.action_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-1 font-medium">{act.description}</p>
                    <p className="text-xs text-slate-400 mt-1">Lead Ref ID: #{act.lead_id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL: NEW LEAD ─── */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Ingest New Instagram Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Instagram Handle *
                </label>
                <input
                  type="text"
                  placeholder="@brand_or_creator"
                  value={newLead.instagram_handle}
                  onChange={(e) => setNewLead({ ...newLead, instagram_handle: e.target.value })}
                  required
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newLead.full_name}
                    onChange={(e) => setNewLead({ ...newLead, full_name: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+27 82 123 4567"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Value (ZAR)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newLead.deal_value}
                    onChange={(e) => setNewLead({ ...newLead, deal_value: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Intent</label>
                <textarea
                  rows="2"
                  placeholder="Inquired via Instagram DM regarding video campaign..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: NEW TASK ─── */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Schedule Follow-up Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Lead *</label>
                <select
                  value={newTask.lead_id}
                  onChange={(e) => setNewTask({ ...newTask, lead_id: e.target.value })}
                  required
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="">-- Choose lead --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.instagram_handle} {l.full_name ? `(${l.full_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="Send pricing brochure"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Action Type</label>
                  <select
                    value={newTask.task_type}
                    onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="follow_up">Follow Up</option>
                    <option value="call">Call</option>
                    <option value="proposal">Proposal</option>
                    <option value="check_in">Check-in</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: LOG ACTIVITY ─── */}
      {showActivityModal && selectedLeadForActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Log Activity on {selectedLeadForActivity.instagram_handle}
            </h2>
            <p className="text-xs text-slate-500 mb-4">Record note or message history for audit trail.</p>
            <form onSubmit={handleLogActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Interaction Type</label>
                <select
                  value={newActivity.action_type}
                  onChange={(e) => setNewActivity({ ...newActivity, action_type: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="message_sent">DM / Message Sent</option>
                  <option value="note_added">Call / Internal Note</option>
                  <option value="stage_change">Stage Change</option>
                  <option value="deal_created">Deal Proposal Logged</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Summary *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details of the interaction..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedLeadForActivity(null);
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
