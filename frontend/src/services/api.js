import axios from 'axios';

/**
 * Browser must call a public URL (localhost or Railway), never Docker service names.
 * Empty baseURL → Vite dev proxy `/api` → localhost:8000.
 */
function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configured) {
    return '';
  }
  if (configured.includes('backend:') || configured.includes('backend/')) {
    return 'http://localhost:8000';
  }
  return configured.replace(/\/$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export async function predictPrices(payload) {
  const { data } = await api.post('/api/predict/', payload);
  return data;
}

export async function searchAirports(query) {
  const { data } = await api.get('/api/airports/search', { params: { q: query } });
  return data;
}

export async function getAirports() {
  const { data } = await api.get('/api/airports/');
  return data;
}
