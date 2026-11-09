import React, { useState } from 'react';
import { 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { INITIAL_TICKETS } from '../data/mockData';

export default function TicketsView({ liveTickets, setActiveTab, setSelectedCustomer, customers }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allTickets = [...liveTickets, ...INITIAL_TICKETS];

  const filteredTickets = allTickets.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.issue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Support Tickets & Escalation Desk</h2>
          <p className="text-xs text-slate-400">
            Tickets generated dynamically by the live AI Support Copilot and historical demo benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {allTickets.length} Total Records
          </span>
          {liveTickets.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +{liveTickets.length} Created in this session
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, customers, issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'in_progress', 'escalated', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filterStatus === st
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Subject / Issue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Escalation</th>
                <th className="py-3 px-4">Data Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">{t.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{t.customerName || t.customerId}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">{t.issue}</td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={`${
                        t.priority === 'Critical' ? 'text-rose-400' : t.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.escalationRequired ? (
                        <span className="text-[10px] text-purple-400 flex items-center gap-1 font-mono font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                          Escalated
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        t.source.includes('Live')
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          const targetCust = customers.find(c => c.id === t.customerId) || customers[0];
                          setSelectedCustomer(targetCust);
                          setActiveTab('assistant');
                        }}
                        className="text-sky-400 hover:text-sky-300 font-medium font-mono text-[11px] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Chat</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No tickets found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
