/**
 * Central API & App Configuration
 * Reads variables from frontend/.env
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://lime-light-b.vercel.app').replace(/\/$/, '');
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'qzkctjzg';
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '+92 345 7867016';
export const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'Limelight Pakistan';

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
  CLOUDINARY_CLOUD_NAME,
  WHATSAPP_NUMBER,
  BRAND_NAME,
  apiUrl
};
