import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Cpu, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Tag
} from 'lucide-react';
import { DEMO_CUSTOMERS } from '../data/mockData';

export default function CustomersView({ setSelectedCustomer, setActiveTab }) {
  const handleOpenChat = (customer) => {
    setSelectedCustomer(customer);
    setActiveTab('assistant');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Customer Directory & Memory Context</h2>
          <p className="text-xs text-slate-400">
            Every customer is automatically provisioned a private, multi-tenant memory bank container in Hindsight Cloud.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>3 Test Customers Provisioned</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {DEMO_CUSTOMERS.map((cust) => (
          <div 
            key={cust.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-base">
                    {cust.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{cust.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400 block">{cust.tier}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                  cust.id === 'synthetic_cust_alpha'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : cust.id === 'synthetic_cust_beta'
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {cust.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cust.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span className="truncate max-w-[200px]" title={cust.bankId}>{cust.bankId}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Known Memory Summary:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{cust.knownContext}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Interactions: <strong className="text-white">{cust.totalInteractions}</strong></span>
                <span>Active: <strong className="text-slate-300">{cust.lastInteraction}</strong></span>
              </div>

              <button
                onClick={() => handleOpenChat(cust)}
                className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open AI Copilot Chat</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
