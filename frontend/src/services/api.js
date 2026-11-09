import axios from 'axios';

// Respect VITE_API_BASE_URL if configured, otherwise rely on Vite's /api proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sends customer message to FastAPI POST /api/chat
 */
export async function sendChatMessage(customerId, message, conversationId = null) {
  const payload = {
    customer_id: customerId,
    message: message,
    conversation_id: conversationId,
  };

  const response = await api.post('/api/chat', payload);
  return response.data;
}

/**
 * Checks backend health status
 */
export async function fetchHealthStatus() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      service: 'MemorySupport AI Backend',
      integrations: {
        hindsight: false,
        groq: false,
        mongodb: false,
      },
      error: error.message,
    };
  }
}
