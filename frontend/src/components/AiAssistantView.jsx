import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Brain, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Bot, 
  ShieldCheck, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { DEMO_CUSTOMERS } from '../data/mockData';

export default function AiAssistantView({ 
  selectedCustomer, 
  setSelectedCustomer, 
  onTicketCreated,
  setActiveTab 
}) {
  // Maintain separate conversation history threads per customer for realistic isolation testing
  const [customerThreads, setCustomerThreads] = useState({
    synthetic_cust_alpha: [
      {
        role: 'assistant',
        content: `Hello Rahul Sharma! I have connected to your active memory bank (memorysupport-demo-synthetic-cust-alpha). How can I assist you with your orders or support requests today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recalledMemories: [],
        ticketId: null,
      }
    ],
    synthetic_cust_beta: [
      {
        role: 'assistant',
        content: `Welcome Priya Patel! You are connected as a new customer with a completely isolated, empty memory container (memorysupport-demo-synthetic-cust-beta). Ask anything to verify that no memories from Customer Alpha are accessible!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recalledMemories: [],
        ticketId: null,
      }
    ],
    synthetic_cust_gamma: [
      {
        role: 'assistant',
        content: `Hello Vikram Rao! I have loaded your enterprise technical support context (memorysupport-demo-synthetic-cust-gamma). How can I help with your network today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recalledMemories: [],
        ticketId: null,
      }
    ]
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [expandedMemoryIdx, setExpandedMemoryIdx] = useState(null);
  const messagesEndRef = useRef(null);

  // Active message thread for the currently selected customer
  const currentMessages = customerThreads[selectedCustomer.id] || [];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  // When customer changes, clear input & error
  const handleCustomerSwitch = (cust) => {
    setSelectedCustomer(cust);
    setErrorMessage(null);
    setExpandedMemoryIdx(null);
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text || !text.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append to current customer's thread
    setCustomerThreads((prev) => ({
      ...prev,
      [selectedCustomer.id]: [...(prev[selectedCustomer.id] || []), userMessage]
    }));

    setInputValue('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Real API call to FastAPI POST /api/chat
      const data = await sendChatMessage(selectedCustomer.id, text.trim());

      const botMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recalledMemories: data.recalled_memories || [],
        ticketId: data.ticket_id,
        issueStatus: data.issue_status,
        escalationRequired: data.escalation_required,
        conversationId: data.conversation_id,
        isLiveResponse: true,
      };

      setCustomerThreads((prev) => ({
        ...prev,
        [selectedCustomer.id]: [...(prev[selectedCustomer.id] || []), botMessage]
      }));

      // Automatically auto-expand memories if memories were recalled
      if (data.recalled_memories && data.recalled_memories.length > 0) {
        setExpandedMemoryIdx((currentMessages.length + 1));
      }

      // Notify parent to add this ticket to live tickets desk
      if (data.ticket_id && onTicketCreated) {
        onTicketCreated({
          id: data.ticket_id,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          issue: text.trim(),
          status: data.issue_status,
          priority: data.escalation_required ? 'High' : 'Medium',
          escalationRequired: data.escalation_required,
          createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Live FastAPI Session',
        });
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      const errDetail = err.response?.data?.detail || err.message || 'Failed to connect to backend';
      setErrorMessage(errDetail);

      const errorMsg = {
        role: 'error',
        content: `Error calling POST /api/chat: ${errDetail}. Verify the backend server is running on port 8000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCustomerThreads((prev) => ({
        ...prev,
        [selectedCustomer.id]: [...(prev[selectedCustomer.id] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
      {/* Left Column: Customer Context & Memory Inspector Drawer */}
      <div className="col-span-12 lg:col-span-4 flex flex-col space-y-4 h-full">
        {/* Customer Context Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Customer Profile</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
              selectedCustomer.id === 'synthetic_cust_alpha' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : selectedCustomer.id === 'synthetic_cust_beta'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {selectedCustomer.status}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-sm">
              {selectedCustomer.avatar}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{selectedCustomer.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedCustomer.email}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Hindsight Bank:</span>
              <span className="text-slate-300 truncate max-w-[170px]" title={selectedCustomer.bankId}>
                {selectedCustomer.bankId}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-slate-200">Customer Context: </strong>
              {selectedCustomer.knownContext}
            </p>
          </div>

          {/* Quick Customer Switcher Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Live Test Switcher:</span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CUSTOMERS.slice(0, 2).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCustomerSwitch(c)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition border ${
                    selectedCustomer.id === c.id
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-semibold'
                      : 'bg-slate-800/70 border-slate-700/70 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block truncate">{c.name}</span>
                  <span className="text-[9px] font-mono text-slate-400 block">
                    {c.id === 'synthetic_cust_alpha' ? 'Has Memory' : 'Zero Memory'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Quick Questions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2 flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Suggested Test Inquiries
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-Click Test</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pt-1">
            {selectedCustomer.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/40 text-xs text-slate-300 hover:text-white transition group flex items-start justify-between gap-2"
              >
                <span className="leading-snug">{q}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Customer Isolation Demo</span>
            <button 
              onClick={() => setActiveTab('memory')}
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View Memory Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: AI Chat Stream & Message Thread */}
      <div className="col-span-12 lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-sm h-full overflow-hidden">
        {/* Chat Thread Header */}
        <div className="p-3.5 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white">Live AI Support Copilot</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Context: <strong className="text-white">{selectedCustomer.name}</strong> • Engine: Groq openai/gpt-oss-120b
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span>Grounded in Hindsight</span>
            </span>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {currentMessages.map((msg, idx) => {
            if (msg.role === 'error') {
              return (
                <div key={idx} className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block font-mono text-rose-200">API Request Failed:</span>
                    <p className="text-[11px]">{msg.content}</p>
                    <button
                      onClick={() => handleSendMessage(selectedCustomer.suggestedQuestions[0])}
                      className="text-[10px] font-mono text-rose-300 underline hover:text-white"
                    >
                      Retry sending request
                    </button>
                  </div>
                </div>
              );
            }

            const isUser = msg.role === 'user';

            return (
              <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono px-1">
                  <span>{isUser ? selectedCustomer.name : 'MemorySupport AI'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Backend Metadata Pill & Recalled Memory Inspector (Assistant Only) */}
                  {!isUser && msg.ticketId && (
                    <div className="pt-2 border-t border-slate-700/80 space-y-2 mt-2">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-sky-400 font-semibold">
                          Ticket: {msg.ticketId}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${
                          msg.issueStatus === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : msg.issueStatus === 'escalated'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          Status: {msg.issueStatus}
                        </span>
                        {msg.escalationRequired && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Escalated to Specialist
                          </span>
                        )}
                      </div>

                      {/* Recalled Memory Accordion */}
                      {msg.recalledMemories && msg.recalledMemories.length > 0 ? (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-2">
                          <button
                            onClick={() => setExpandedMemoryIdx(expandedMemoryIdx === idx ? null : idx)}
                            className="w-full flex items-center justify-between text-[11px] font-mono text-sky-400 font-semibold hover:text-sky-300"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              LIVE HINDSIGHT CLOUD RECALL ({msg.recalledMemories.length} Facts)
                            </span>
                            {expandedMemoryIdx === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {expandedMemoryIdx === idx && (
                            <div className="space-y-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-300">
                              <span className="text-[10px] font-mono text-slate-500 block">
                                Container: {selectedCustomer.bankId}
                              </span>
                              {msg.recalledMemories.map((mem, mIdx) => (
                                <div key={mIdx} className="p-2.5 bg-slate-900/90 rounded border border-slate-800/80 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                    <span className="text-sky-400 uppercase font-bold">[{mem.type || 'Fact'}]</span>
                                    {mem.score && <span className="text-emerald-400">Relevance: {(mem.score * 100).toFixed(0)}%</span>}
                                  </div>
                                  <p className="text-slate-200">{mem.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-slate-950/40 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span>Hindsight recalled 0 previous memories for this customer (Verified isolated container).</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Animation while Groq is inferencing */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono px-1">
                <span>MemorySupport AI</span>
                <span>•</span>
                <span>Inferring with Groq</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-sm p-3.5 flex items-center space-x-3 text-xs text-slate-300 shadow-sm">
                <div className="w-5 h-5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Recalling memory & generating grounded response...</p>
                  <p className="text-[10px] font-mono text-slate-400">Hindsight arecall() ➔ Groq openai/gpt-oss-120b</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur">
          {errorMessage && (
            <div className="mb-2 text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={`Ask as ${selectedCustomer.name} (e.g. "What happened to my previous order?")...`}
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
