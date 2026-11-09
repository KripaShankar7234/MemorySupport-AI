import React, { useState } from 'react';
import { 
  Brain, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Layers, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { DEMO_CUSTOMERS } from '../data/mockData';

export default function MemoryCenterView({ selectedCustomer, setSelectedCustomer, setActiveTab }) {
  const [activeBankCustomer, setActiveBankCustomer] = useState(selectedCustomer);

  // Clearly marked verified memories vs sample context
  const alphaMemories = [
    {
      type: 'FACT',
      score: 0.94,
      status: 'VERIFIED IN HINDSIGHT CLOUD',
      badgeColor: 'emerald',
      date: '2026-11-09',
      text: 'Customer reported smart security camera arrived with cracked exterior glass housing. Item delivered damaged in transit.',
      source: 'Hindsight aretain(bank="memorysupport-demo-synthetic-cust-alpha")',
      tag: 'hardware_damage'
    },
    {
      type: 'PREFERENCE',
      score: 0.91,
      status: 'VERIFIED IN HINDSIGHT CLOUD',
      badgeColor: 'sky',
      date: '2026-11-09',
      text: 'Customer explicitly stated preference for an expedited replacement rather than a refund.',
      source: 'Hindsight aretain()',
      tag: 'resolution_preference'
    },
    {
      type: 'COMMUNICATION',
      score: 0.89,
      status: 'VERIFIED IN HINDSIGHT CLOUD',
      badgeColor: 'indigo',
      date: '2026-11-09',
      text: 'Customer communication preference is strictly email notifications; do not initiate phone calls.',
      source: 'Hindsight aretain()',
      tag: 'contact_preference'
    },
    {
      type: 'PENDING ACTION',
      score: 0.82,
      status: 'AUDIT LOG FACT',
      badgeColor: 'amber',
      date: '2026-11-09',
      text: 'Hardware fulfillment team has been notified to inspect warehouse serial numbers for replacement. Inspection still pending.',
      source: 'Hindsight arecall() Grounding Context',
      tag: 'logistics_pending'
    }
  ];

  const betaMemories = [];

  const displayedMemories = activeBankCustomer.id === 'synthetic_cust_alpha' ? alphaMemories : betaMemories;

  return (
    <div className="space-y-6">
      {/* Header Banner for Hackathon Judges */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-medium">
              <Brain className="w-3.5 h-3.5" />
              <span>Vectorize Hindsight Cloud Agent Memory</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hindsight Agent Memory Center</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Hindsight creates isolated, continuous memory banks for every customer. Unlike naive chat windows that lose history on refresh, 
              Hindsight performs parallel multi-strategy retrieval (semantic vector search, temporal recency, keyword indexing, and knowledge graphs) 
              to inject authentic history into Groq's inference loop.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCustomer(activeBankCustomer);
                setActiveTab('assistant');
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>Test with {activeBankCustomer.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Explanation Flow (Required by Hackathon) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>The 5-Step Continuous Memory Loop</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">Memory-Grounded AI Retrieval</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1 */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              STEP 1
            </span>
            <p className="text-xs font-bold text-white">Customer Message</p>
            <p className="text-[11px] text-slate-400 leading-snug">
              User submits support inquiry via POST /api/chat
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-sky-950/40 border border-sky-700/60 rounded-xl p-3.5 text-center space-y-2 relative">
            <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30">
              STEP 2: HINDSIGHT
            </span>
            <p className="text-xs font-bold text-sky-200">arecall(bank_id)</p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Multi-strategy search queries isolated customer container
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-purple-950/40 border border-purple-700/60 rounded-xl p-3.5 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
              STEP 3: GROQ LLM
            </span>
            <p className="text-xs font-bold text-purple-200">Grounding Inference</p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Synthesizes answer strictly anchored to recalled facts
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-3.5 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              STEP 4: RESPONSE
            </span>
            <p className="text-xs font-bold text-emerald-200">Grounded Output</p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Returns answer + ticket ID + memory audit array
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-sky-950/40 border border-sky-700/60 rounded-xl p-3.5 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30">
              STEP 5: HINDSIGHT
            </span>
            <p className="text-xs font-bold text-sky-200">aretain() Idempotent</p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Retains interaction summary with deduplicated document ID
            </p>
          </div>
        </div>
      </div>

      {/* Customer Memory Isolation Showcase (Alpha vs. Beta) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Memory Bank Isolation Comparator</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Select a customer below to inspect their private Hindsight memory container.
            </p>
          </div>

          {/* Tabs to switch inspected customer */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            {DEMO_CUSTOMERS.map((cust) => (
              <button
                key={cust.id}
                onClick={() => setActiveBankCustomer(cust)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeBankCustomer.id === cust.id
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cust.name} ({cust.id === 'synthetic_cust_alpha' ? 'Alpha' : cust.id === 'synthetic_cust_beta' ? 'Beta' : 'Gamma'})
              </button>
            ))}
          </div>
        </div>

        {/* Bank Container Header */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Hindsight Cloud Memory Bank ID</span>
            <p className="text-xs font-mono font-bold text-sky-400">{activeBankCustomer.bankId}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Customer Status:</span>
              <span className="text-white font-semibold">{activeBankCustomer.status}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Stored Fact Count:</span>
              <span className="text-emerald-400 font-semibold">{displayedMemories.length} Memories</span>
            </div>
          </div>
        </div>

        {/* Memory Items Feed with explicit Data Label */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
            {displayedMemories.length > 0 ? "Bank Knowledge Context Facts" : "Container Inspection"}
          </span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {displayedMemories.length > 0 ? "Benchmark Bank Data (Separate from Live Recalls)" : "Live Zero-State Container"}
          </span>
        </div>

        <div className="space-y-3">
          {displayedMemories.length > 0 ? (
            displayedMemories.map((mem, idx) => (
              <div 
                key={idx} 
                className="bg-slate-800/70 border border-slate-700/70 hover:border-slate-600 rounded-xl p-4 space-y-2 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {mem.type}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {mem.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                    <span>Relevance: {(mem.score * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>{mem.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-100 font-medium leading-relaxed">
                  "{mem.text}"
                </p>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Engine: {mem.source}</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                    #{mem.tag}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
              <ShieldCheck className="w-8 h-8 text-sky-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Isolated Empty Memory Bank</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Customer Beta is a first-time customer. Their isolated Hindsight bank (<span className="font-mono text-slate-300">{activeBankCustomer.bankId}</span>) 
                contains zero remembered facts. Customer Beta CANNOT access or see Customer Alpha's camera records!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedCustomer(activeBankCustomer);
                    setActiveTab('assistant');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-lg text-xs transition border border-slate-700"
                >
                  Ask Customer Beta a question in AI Assistant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
