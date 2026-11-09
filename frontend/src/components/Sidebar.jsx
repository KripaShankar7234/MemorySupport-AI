import React from 'react';
import { 
  Brain, 
  LayoutDashboard, 
  MessageSquare, 
  Cpu, 
  Users, 
  Ticket, 
  Sparkles,
  Database,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, healthStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Support Assistant', icon: MessageSquare, badge: 'Live API' },
    { id: 'memory', label: 'Memory Center', icon: Cpu, badge: 'Hindsight' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
  ];

  const hindsightReady = healthStatus?.integrations?.hindsight;
  const groqReady = healthStatus?.integrations?.groq;
  const mongoReady = healthStatus?.integrations?.mongodb;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      {/* Brand & Tagline */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              MemorySupport <span className="text-[10px] bg-sky-500/20 text-sky-400 font-mono font-medium px-1.5 py-0.5 rounded border border-sky-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Customer Support That Remembers.</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend Integration Live Status Indicators */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2.5 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[10px] uppercase tracking-wider font-semibold">
          <span>Engine Status</span>
          <span className="text-emerald-400">FastAPI :8000</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${hindsightReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Hindsight Cloud</span>
          </div>
          <span className="text-slate-500 text-[10px]">{hindsightReady ? 'Connected' : 'Active'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-300">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Groq LLM</span>
          </div>
          <span className="text-purple-400 text-[10px]">gpt-oss-120b</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-300">
            <Database className={`w-3 h-3 ${mongoReady ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>MongoDB Atlas</span>
          </div>
          <span className={`text-[10px] ${mongoReady ? 'text-emerald-400 font-semibold' : 'text-amber-400/90'}`}>
            {mongoReady ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        <div className="pt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Bengaluru 2.0 Hackathon</span>
        </div>
      </div>
    </aside>
  );
}
