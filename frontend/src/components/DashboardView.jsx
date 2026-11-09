import React from 'react';
import { 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Cpu, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Brain
} from 'lucide-react';
import { INITIAL_TICKETS } from '../data/mockData';

export default function DashboardView({ setActiveTab, setSelectedCustomer, customers, liveTickets }) {
  const allTickets = [...liveTickets, ...INITIAL_TICKETS];

  const stats = [
    { label: 'Total Customers', value: '1,482', change: '+12% this mo.', icon: Users, color: 'sky' },
    { label: 'Support Conversations', value: '3,891', change: '+24% this wk.', icon: MessageSquare, color: 'indigo' },
    { label: 'Open Tickets', value: '24', change: '-5 today', icon: Clock, color: 'amber' },
    { label: 'Resolved Tickets', value: '3,812', change: '98.2% rate', icon: CheckCircle2, color: 'emerald' },
    { label: 'Escalated Issues', value: '14', change: 'Flagged for review', icon: AlertCircle, color: 'purple' },
    { label: 'Memory Recall Hit Rate', value: '94.6%', change: 'Powered by Hindsight', icon: Cpu, color: 'teal' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Hackathon Showcase Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bengaluru 2.0 Hackathon • Live Demo Ready</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MemorySupport AI: Customer Support That Remembers
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional support bots forget context the moment a session closes. MemorySupport AI uses 
              <strong className="text-sky-300"> Hindsight Cloud</strong> multi-strategy agent memory to recall 
              historical grievances, customer preferences, and hardware problems across sessions, grounding 
              <strong className="text-purple-300"> Groq's high-speed LLM</strong> to produce memory-grounded AI responses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const alpha = customers.find(c => c.id === 'synthetic_cust_alpha');
                if (alpha) setSelectedCustomer(alpha);
                setActiveTab('assistant');
              }}
              className="flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-sky-600/25"
            >
              <Brain className="w-4 h-4" />
              <span>Test Customer Alpha (Has Memory)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-4 py-2.5 rounded-xl text-xs transition"
            >
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Inspect Memory Center</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards (Fabricated Demo Benchmark Metrics) */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Support Operations Overview
          </span>
          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded font-semibold">
            DEMO DATA (SYNTHETIC BENCHMARK)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">{s.label}</span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-white tracking-tight">{s.value}</span>
                    <span className="text-[8px] font-mono bg-slate-800 text-amber-400/90 px-1 py-0.5 rounded">DEMO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.change}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Pipeline Flow Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Continuous Memory Pipeline Architecture</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Live Production Sequence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold">1. Inbound Query</span>
            <p className="text-xs font-semibold text-white">Customer Message</p>
            <p className="text-[11px] text-slate-400">POST /api/chat received by FastAPI</p>
          </div>

          <div className="bg-sky-950/40 border border-sky-800/40 rounded-lg p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold">2. Multi-Strategy Recall</span>
            <p className="text-xs font-semibold text-sky-200">Hindsight Cloud arecall()</p>
            <p className="text-[11px] text-slate-400">Queries isolated bank container</p>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/40 rounded-lg p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold">3. Fast Grounded AI</span>
            <p className="text-xs font-semibold text-purple-200">Groq gpt-oss-120b</p>
            <p className="text-[11px] text-slate-400">Distinguishes confirmed vs pending actions</p>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">4. Audit Storage</span>
            <p className="text-xs font-semibold text-emerald-200">MongoDB Atlas</p>
            <p className="text-[11px] text-slate-400">Stores tickets & interaction history</p>
          </div>

          <div className="bg-sky-950/40 border border-sky-800/40 rounded-lg p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold">5. Idempotent Retain</span>
            <p className="text-xs font-semibold text-sky-200">Hindsight aretain()</p>
            <p className="text-[11px] text-slate-400">Deduplicated write for future recall</p>
          </div>
        </div>
      </div>

      {/* Recent Support Tickets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Support Activity</h3>
            <p className="text-[11px] text-slate-400">Showing combined live session tickets and demo benchmark records</p>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            {allTickets.length} Total Tickets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Ticket ID</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Issue Summary</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allTickets.slice(0, 6).map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-medium text-sky-400">{t.id}</td>
                  <td className="py-3 px-4 text-white font-medium">{t.customerName || t.customerId}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{t.issue}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                      t.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : t.status === 'escalated'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-semibold ${
                      t.priority === 'Critical' ? 'text-rose-400' : t.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {t.escalationRequired ? (
                      <span className="text-[10px] text-purple-400 flex items-center gap-1 font-mono font-medium">
                        <AlertCircle className="w-3 h-3 text-purple-400" />
                        Escalated
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
