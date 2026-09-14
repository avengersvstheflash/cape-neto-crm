import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import MetricsBar from './components/MetricsBar';
import Toast from './components/Toast';
import DashboardView from './components/DashboardView';
import LeadsView from './components/LeadsView';
import TasksView from './components/TasksView';
import ClientsView from './components/ClientsView';
import ActivityView from './components/ActivityView';
import LeadDetailPanel from './components/LeadDetailPanel';

export default function App() {
  // ── Auth State ──
  const [token, setToken] = useState(localStorage.getItem('cape_neto_token') || '');
  const [currentUser, setCurrentUser] = useState(null);

  // ── Data State ──
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── UI State ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prevTab, setPrevTab] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // ── Toast System ──
  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Auth Handlers ──
  const handleLogin = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('cape_neto_token', data.access_token);
    setToken(data.access_token);
  };

  const handleLogout = () => {
    localStorage.removeItem('cape_neto_token');
    setToken('');
    setCurrentUser(null);
    setLeads([]);
    setTasks([]);
    setClients([]);
    setActivities([]);
  };

  // ── Data Fetching ──
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [l, t, c, a] = await Promise.all([
        api.fetchLeads({ limit: 100 }),
        api.fetchTasks({ limit: 100 }),
        api.fetchClients().catch(() => []),
        api.fetchActivities({ limit: 100 }),
      ]);
      setLeads(l || []);
      setTasks(t || []);
      setClients(c || []);
      setActivities(a || []);
    } catch (err) {
      addToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Validate token & fetch on mount
  useEffect(() => {
    if (!token) return;
    api.fetchMe()
      .then(user => {
        setCurrentUser(user);
        fetchAllData();
      })
      .catch(() => handleLogout());
  }, [token]);

  // ── Action Handlers ──
  const handleCreateLead = async (payload) => {
    try {
      await api.createLead(payload);
      addToast('Lead added successfully!');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      addToast(`Lead updated to ${newStatus}`);
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.completeTask(taskId);
      addToast('Task completed!');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateTask = async (payload) => {
    try {
      await api.createTask(payload);
      addToast('Task scheduled!');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
  };

  // ── Tab Switching with Animation ──
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  // ── Computed ──
  const pendingCount = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
  const overdueCount = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.status !== 'done' && t.status !== 'cancelled' && t.due_date && t.due_date < today;
  }).length;

  // ── Render ──
  if (!token) {
    return (
      <>
        <Toast toasts={toasts} removeToast={removeToast} />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          currentUser={currentUser}
          pendingCount={pendingCount}
          overdueCount={overdueCount}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Metrics Bar */}
          <MetricsBar
            leads={leads}
            tasks={tasks}
            clients={clients}
            loading={loading}
            onRefresh={fetchAllData}
          />

          {/* View Content */}
          <main className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === 'dashboard' && (
              <DashboardView
                leads={leads}
                tasks={tasks}
                activities={activities}
                onOpenLead={handleOpenLead}
              />
            )}
            {activeTab === 'leads' && (
              <LeadsView
                leads={leads}
                onOpenLead={handleOpenLead}
                onCreateLead={handleCreateLead}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                leads={leads}
                onCompleteTask={handleCompleteTask}
                onCreateTask={handleCreateTask}
                onOpenLead={handleOpenLead}
              />
            )}
            {activeTab === 'clients' && (
              <ClientsView
                clients={clients}
                leads={leads}
              />
            )}
            {activeTab === 'activities' && (
              <ActivityView
                activities={activities}
                leads={leads}
                onOpenLead={handleOpenLead}
              />
            )}
          </main>
        </div>
      </div>

      {/* Lead Detail Slide-Over */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRefresh={fetchAllData}
          addToast={addToast}
        />
      )}
    </div>
  );
}
