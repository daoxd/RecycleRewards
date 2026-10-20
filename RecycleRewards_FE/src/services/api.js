import { auth } from '../config/firebase.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://recycle-rewards.duckdns.org/api').replace(/\/$/, '');

export async function request(path, { method = 'GET', body, role } = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (error) {
    const connectionError = new Error(`Không thể kết nối backend (${API_URL}): ${error.message}`);
    connectionError.cause = error;
    throw connectionError;
  }

  const rawBody = await response.text();
  let data = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    data = rawBody;
  }

  if (!response.ok) {
    const message = typeof data === 'string'
      ? data.trim()
      : data.message || data.error || JSON.stringify(data);
    const error = new Error(`HTTP ${response.status}: ${message || response.statusText || 'Backend trả về lỗi.'}`);
    error.status = response.status;
    error.response = data;
    error.body = rawBody;
    throw error;
  }
  return data;
}
