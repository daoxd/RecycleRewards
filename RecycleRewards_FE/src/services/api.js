import { auth } from '../config/firebase.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function request(path, { method = 'GET', body, role } = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Không thể kết nối máy chủ.');
    error.status = response.status;
    throw error;
  }
  return data;
}
