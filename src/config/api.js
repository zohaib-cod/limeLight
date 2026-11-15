/**
 * Central API Configuration
 * Reads backend URL from frontend/.env (VITE_API_URL)
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://lime-light-b.vercel.app').replace(/\/$/, '');

/**
 * Helper to construct full API endpoint URL
 * @param {string} endpoint - e.g. '/api/slides'
 * @returns {string} - e.g. 'https://lime-light-b.vercel.app/api/slides'
 */
export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  apiUrl
};
