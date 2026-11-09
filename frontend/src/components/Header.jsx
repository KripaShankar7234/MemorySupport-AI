import React from 'react';
import { 
  User, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { DEMO_CUSTOMERS } from '../data/mockData';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  selectedCustomer, 
  setSelectedCustomer, 
  healthStatus, 
  refreshHealth, 
  isRefreshing 
}) {
  const titles = {
    dashboard: 'Enterprise Support Overview',
    assistant: 'AI Support Assistant (Continuous Memory)',
    memory: 'Hindsight Memory Center',
    customers: 'Customer Directory & Memory Banks',
    tickets: 'Support Tickets & Escalation Desk',
  };

  const isHealthy = healthStatus?.status === 'healthy';

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Page Title & Breadcrumb */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          {titles[activeTab] || 'Dashboard'}
        </h2>
        <p className="text-[11px] text-slate-400">
          MemorySupport AI Platform • <span className="font-mono text-slate-300">FastAPI + Hindsight Cloud + Groq</span>
        </p>
      </div>

      {/* Right Action Tools: Customer Switcher & Health Status */}
      <div className="flex items-center space-x-3">
        {/* Customer Switcher */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-mono text-[11px]">
            <User className="w-3.5 h-3.5 text-sky-400" />
            Active:
          </span>
          <select
            value={selectedCustomer.id}
            onChange={(e) => {
              const cust = DEMO_CUSTOMERS.find((c) => c.id === e.target.value);
              if (cust) setSelectedCustomer(cust);
            }}
            className="bg-slate-900 text-slate-100 border border-slate-700 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {DEMO_CUSTOMERS.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} ({cust.id === 'synthetic_cust_alpha' ? 'Alpha - Cam Memory' : cust.id === 'synthetic_cust_beta' ? 'Beta - Zero Memory' : 'Gamma - Tech'})
              </option>
            ))}
          </select>
        </div>

        {/* Live Backend Connection Pill */}
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshHealth}
            title="Refresh backend status"
            disabled={isRefreshing}
            className={`p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition ${
              isRefreshing ? 'animate-spin text-sky-400' : ''
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-mono ${
            isHealthy 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
          }`}>
            {isHealthy ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[11px]">
              {healthStatus?.status === 'offline' ? 'Backend Offline' : isHealthy ? 'API Connected' : 'Degraded (Live)'}
            </span>
          </div>
        </div>

        {/* Quick Launch Live Chat Button */}
        {activeTab !== 'assistant' && (
          <button
            onClick={() => setActiveTab('assistant')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open Copilot</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        )}
      </div>
    </header>
  );
}
