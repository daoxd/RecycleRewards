import { request } from './api.js';

export const profileService = {
  getCurrent: async (role) => {
    const response = await request('/users/me', { role });
    if (!response || !response.user) throw new Error('Dữ liệu hồ sơ từ máy chủ không hợp lệ.');
    return response.user;
  },
  updateCurrent: async (payload, role) => {
    const response = await request('/users/me', { method: 'PATCH', body: payload, role });
    if (!response || !response.user) throw new Error('Dữ liệu hồ sơ cập nhật từ máy chủ không hợp lệ.');
    return response.user;
  },
};
