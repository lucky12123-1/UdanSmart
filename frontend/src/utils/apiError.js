export function formatApiError(error) {
  if (!error) {
    return 'Something went wrong.';
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot reach the API. Start the backend (port 8000) or check VITE_API_BASE_URL.';
  }
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(' ');
  }
  if (detail && typeof detail === 'object') {
    return detail.message || JSON.stringify(detail);
  }
  return error.message || 'Could not fetch prices.';
}
