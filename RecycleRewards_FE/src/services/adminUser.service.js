import { request } from './api.js';

export const adminUserService = {
  list: (search = '') => request(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (payload) => request('/admin/users', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/admin/users/${id}`, { method: 'PATCH', body: payload }),
  remove: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};
