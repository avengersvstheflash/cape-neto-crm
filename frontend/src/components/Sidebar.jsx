import React from 'react';
import {
  LayoutDashboard, Target, CheckSquare, Building2, Activity, LogOut, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads & Pipeline', icon: Target },
  { id: 'tasks', label: 'Task Queue', icon: CheckSquare },
  { id: 'clients', label: 'Client Accounts', icon: Building2 },
  { id: 'activities', label: 'Activity Log', icon: Activity },
];

export default function Sidebar({ activeTab, setActiveTab, currentUser, pendingCount, overdueCount, onLogout }) {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
            CN
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-[15px] tracking-tight leading-tight">Cape Neto</h1>
            <p className="text-[11px] text-slate-400 font-medium">CRM Workspace</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const badge = item.id === 'tasks' ? pendingCount : null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/5'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {/* Active indicator bar */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300
                ${isActive ? 'h-5 bg-indigo-600' : 'h-0 bg-transparent'}`}
              />
              <Icon className={`w-[18px] h-[18px] transition-colors duration-200
                ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  ${overdueCount > 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-indigo-100 text-indigo-700'
                  }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      {currentUser && (
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-[11px] font-bold">
              {currentUser.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 truncate">{currentUser.email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{currentUser.role}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all duration-200 font-medium active:scale-[0.97]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}

