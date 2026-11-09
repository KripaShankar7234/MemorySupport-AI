export const DEMO_CUSTOMERS = [
  {
    id: "synthetic_cust_alpha",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    avatar: "RS",
    tier: "Premium Member",
    bankId: "memorysupport-demo-synthetic-cust-alpha",
    status: "Active Ticket",
    statusColor: "emerald",
    totalInteractions: 4,
    lastInteraction: "10 mins ago",
    knownContext: "Received smart camera with cracked glass housing. Explicit preference: replacement over refund, strictly email updates.",
    suggestedQuestions: [
      "Can you confirm if I'm getting a refund or a replacement for my camera, and will you call me?",
      "What is the status of my damaged camera order?",
      "Can you review my preferred communication channel?",
    ]
  },
  {
    id: "synthetic_cust_beta",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    avatar: "PP",
    tier: "New Customer",
    bankId: "memorysupport-demo-synthetic-cust-beta",
    status: "Zero Prior Memory",
    statusColor: "sky",
    totalInteractions: 0,
    lastInteraction: "Never",
    knownContext: "First-time visitor. Empty isolated memory bank. Used to prove cross-customer memory isolation.",
    suggestedQuestions: [
      "What happened to my previous order?",
      "Can you check if my camera was replaced?",
      "Do I have any pending support tickets?",
    ]
  },
  {
    id: "synthetic_cust_gamma",
    name: "Vikram Rao",
    email: "vikram.rao@example.com",
    avatar: "VR",
    tier: "Enterprise",
    bankId: "memorysupport-demo-synthetic-cust-gamma",
    status: "Recurring Issue",
    statusColor: "amber",
    totalInteractions: 6,
    lastInteraction: "Yesterday",
    knownContext: "Recurring Wi-Fi router packet loss. Hardware diagnostic history logged.",
    suggestedQuestions: [
      "I am still having intermittent disconnects on my office gateway.",
      "Has my replacement power adapter shipped?",
    ]
  }
];

export const INITIAL_TICKETS = [
  {
    id: "TKT-ALPHA-9912",
    customerId: "synthetic_cust_alpha",
    customerName: "Rahul Sharma",
    issue: "Smart security camera damaged casing in transit",
    status: "in_progress",
    priority: "High",
    escalationRequired: false,
    createdAt: "2026-11-09 10:15 AM",
    source: "DEMO DATA (SYNTHETIC)"
  },
  {
    id: "TKT-GAMMA-4821",
    customerId: "synthetic_cust_gamma",
    customerName: "Vikram Rao",
    issue: "Gateway router firmware sync failure",
    status: "escalated",
    priority: "Critical",
    escalationRequired: true,
    createdAt: "2026-11-08 04:30 PM",
    source: "DEMO DATA (SYNTHETIC)"
  },
  {
    id: "TKT-BETA-0012",
    customerId: "synthetic_cust_beta",
    customerName: "Priya Patel",
    issue: "General inquiry on return window policy",
    status: "resolved",
    priority: "Low",
    escalationRequired: false,
    createdAt: "2026-11-07 02:00 PM",
    source: "DEMO DATA (SYNTHETIC)"
  }
];
