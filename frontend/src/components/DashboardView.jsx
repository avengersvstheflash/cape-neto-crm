import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { Activity, TrendingUp, Target, CheckCircle2 } from 'lucide-react';

const STATUS_COLORS = {
  active: '#6366f1',
  won: '#10b981',
  lost: '#f43f5e',
  paused: '#f59e0b',
};

const SOURCE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_LABELS = {
  stage_change: 'Stage Change',
  task_created: 'Task Created',
  task_completed: 'Task Completed',
  note_added: 'Note Added',
  deal_created: 'Deal Created',
  message_sent: 'Message Sent',
  status_change: 'Status Change',
  webhook_received: 'Webhook',
};

export default function DashboardView({
  leads = [],
  tasks = [],
  activities = [],
  onOpenLead
}) {
  // ── Pipeline Funnel ──
  const pipelineData = useMemo(() => {
    const counts = { active: 0, won: 0, paused: 0, lost: 0 };
    leads.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++; });
    return [
      { name: 'Active', value: counts.active, fill: STATUS_COLORS.active },
      { name: 'Won', value: counts.won, fill: STATUS_COLORS.won },
      { name: 'Paused', value: counts.paused, fill: STATUS_COLORS.paused },
      { name: 'Lost', value: counts.lost, fill: STATUS_COLORS.lost },
    ];
  }, [leads]);

  // ── Source Distribution ──
  const sourceData = useMemo(() => {
    const map = {};
    leads.forEach(l => { 
      const src = l.source || 'Instagram';
      map[src] = (map[src] || 0) + 1; 
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // ── Revenue by Status ──
  const revenueData = useMemo(() => {
    const map = { active: 0, won: 0, paused: 0, lost: 0 };
    leads.forEach(l => {
      const v = parseFloat(l.deal_value) || 0;
      if (map[l.status] !== undefined) map[l.status] += v;
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value),
      fill: STATUS_COLORS[name],
    }));
  }, [leads]);

  // ── Task Completion ──
  const taskData = useMemo(() => {
    const done = tasks.filter(t => t.status === 'done').length;
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    return [
      { name: 'Completed', value: done, fill: '#10b981' },
      { name: 'Pending', value: pending, fill: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, fill: '#94a3b8' },
    ];
  }, [tasks]);

  const recentActivities = activities.slice(0, 8);
  const leadMap = useMemo(() => Object.fromEntries(leads.map(l => [l.id, l])), [leads]);

  return (
    <div className="space-y-6 animate-view-enter">
      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline Funnel */}
        <ChartCard title="Lead Pipeline" icon={Target} subtitle="Distribution by status">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                cursor={{ fill: 'rgba(99,102,241,0.05)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {pipelineData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Source Distribution */}
        <ChartCard title="Lead Sources" icon={Activity} subtitle="Where leads come from">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-600 capitalize">{value}</span>}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Pipeline */}
        <ChartCard title="Revenue Pipeline" icon={TrendingUp} subtitle="Deal value by status (ZAR)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} layout="vertical" barSize={24}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(v) => [`R ${v.toLocaleString()}`, 'Value']}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {revenueData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Task Completion */}
        <ChartCard title="Task Completion" icon={CheckCircle2} subtitle="Work progress overview">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={taskData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {taskData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
          <span className="text-xs text-slate-400 ml-auto">{activities.length} total events</span>
        </div>
        <div className="divide-y divide-slate-50">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No activities recorded yet.</div>
          ) : (
            recentActivities.map(act => {
              const lead = leadMap[act.lead_id];
              return (
                <div key={act.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors duration-150">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      <span className="font-semibold">{ACTION_LABELS[act.action_type] || act.action_type}</span>
                      {act.description && <span className="text-slate-500"> — {act.description}</span>}
                    </p>
                  </div>
                  {lead && (
                    <button
                      onClick={() => onOpenLead && onOpenLead(lead)}
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors duration-150 whitespace-nowrap"
                    >
                      {lead.instagram_handle}
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(act.created_at)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}