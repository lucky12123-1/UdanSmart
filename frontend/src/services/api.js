import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
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
