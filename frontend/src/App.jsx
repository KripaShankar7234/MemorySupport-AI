import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AiAssistantView from './components/AiAssistantView';
import MemoryCenterView from './components/MemoryCenterView';
import CustomersView from './components/CustomersView';
import TicketsView from './components/TicketsView';
import { DEMO_CUSTOMERS } from './data/mockData';
import { fetchHealthStatus } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('assistant'); // Default to AI Support Assistant per user priority
  const [selectedCustomer, setSelectedCustomer] = useState(DEMO_CUSTOMERS[0]); // Customer Alpha
  const [healthStatus, setHealthStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveTickets, setLiveTickets] = useState([]);

  // Check backend health on mount and periodically
  const loadHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchHealthStatus();
      setHealthStatus(data);
    } catch (err) {
      console.error('Health fetch failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // 30s background poll
    return () => clearInterval(interval);
  }, []);

  const handleTicketCreated = (ticket) => {
    setLiveTickets((prev) => [ticket, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex antialiased">
      {/* SaaS Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        healthStatus={healthStatus} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          healthStatus={healthStatus}
          refreshHealth={loadHealth}
          isRefreshing={isRefreshing}
        />

        <main className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              setActiveTab={setActiveTab}
              setSelectedCustomer={setSelectedCustomer}
              customers={DEMO_CUSTOMERS}
              liveTickets={liveTickets}
            />
          )}

          {activeTab === 'assistant' && (
            <AiAssistantView 
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              onTicketCreated={handleTicketCreated}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryCenterView 
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView 
              setSelectedCustomer={setSelectedCustomer}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketsView 
              liveTickets={liveTickets}
              setActiveTab={setActiveTab}
              setSelectedCustomer={setSelectedCustomer}
              customers={DEMO_CUSTOMERS}
            />
          )}
        </main>
      </div>
    </div>
  );
}
