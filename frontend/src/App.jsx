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
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── UI State ──
  const [activeTab, setActiveTab] = useState('dashboard');
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
    setStages([]);
    setSelectedLead(null);
  };

  // ── Data Fetching ──
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [l, t, c, a, s] = await Promise.all([
        api.fetchLeads({ limit: 100 }),
        api.fetchTasks({ limit: 100 }),
        api.fetchClients().catch(() => []),
        api.fetchActivities({ limit: 100 }),
        api.fetchStages().catch(() => []),
      ]);
      setLeads(l || []);
      setTasks(t || []);
      setClients(c || []);
      setActivities(a || []);
      setStages(s || []);

      // If a lead is currently selected, update its reference
      if (selectedLead) {
        const updatedSelected = (l || []).find(lead => lead.id === selectedLead.id);
        if (updatedSelected) setSelectedLead(updatedSelected);
      }
    } catch (err) {
      addToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, selectedLead]);

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

  // ── Lead Handlers ──
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

  const handleUpdateLead = async (leadId, payload) => {
    try {
      await api.updateLead(leadId, payload);
      addToast('Lead details updated!');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await api.deleteLead(leadId);
      addToast('Lead deleted');
      if (selectedLead?.id === leadId) setSelectedLead(null);
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
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

  // ── Task Handlers ──
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

  const handleUpdateTask = async (taskId, payload) => {
    try {
      await api.updateTask(taskId, payload);
      addToast('Task updated successfully');
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

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      addToast('Task deleted');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ── Client Handlers ──
  const handleCreateClient = async (payload) => {
    try {
      await api.createClient(payload);
      addToast('Client registered successfully');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleUpdateClient = async (clientId, payload) => {
    try {
      await api.updateClient(clientId, payload);
      addToast('Client account updated');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await api.deleteClient(clientId);
      addToast('Client account deleted');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ── Activity Handlers ──
  const handleUpdateActivity = async (activityId, payload) => {
    try {
      await api.updateActivity(activityId, payload);
      addToast('Activity updated');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await api.deleteActivity(activityId);
      addToast('Activity deleted');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
  };

  // ── Computed ──
  const pendingCount = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
  const overdueCount = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.status !== 'done' && t.status !== 'cancelled' && t.due_date && t.due_date < today;
  }).length;

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
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          pendingCount={pendingCount}
          overdueCount={overdueCount}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Metrics Bar */}
          <MetricsBar
            leads={leads}
            tasks={tasks}
            clients={clients}
            loading={loading}
            onRefresh={fetchAllData}
          />

          {/* Tab View Routing */}
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
                stages={stages}
                currentUser={currentUser}
                onOpenLead={handleOpenLead}
                onCreateLead={handleCreateLead}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                leads={leads}
                currentUser={currentUser}
                onCompleteTask={handleCompleteTask}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onOpenLead={handleOpenLead}
              />
            )}
            {activeTab === 'clients' && (
              <ClientsView
                clients={clients}
                leads={leads}
                currentUser={currentUser}
                onCreateClient={handleCreateClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
              />
            )}
            {activeTab === 'activities' && (
              <ActivityView
                activities={activities}
                leads={leads}
                currentUser={currentUser}
                onOpenLead={handleOpenLead}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            )}
          </main>
        </div>
      </div>

      {/* Lead Detail Slide-Over Drawer */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          stages={stages}
          currentUser={currentUser}
          onClose={() => setSelectedLead(null)}
          onRefresh={fetchAllData}
          addToast={addToast}
        />
      )}
    </div>
  );
}
