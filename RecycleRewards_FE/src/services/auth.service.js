import { request } from './api.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase.js';

export const authService = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  googleLogin: async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const idToken = await result.user.getIdToken();
    return request('/auth/google', { method: 'POST', body: { idToken } });
  },
  studentDashboard: (studentId) => request(`/submissions/dashboard/${encodeURIComponent(studentId)}`, { role: 'student' }),
  mySubmissions: (studentId) => request(`/submissions?studentId=${encodeURIComponent(studentId)}`, { role: 'student' }),
  createSubmission: (payload) => request('/submissions', { method: 'POST', body: payload, role: 'student' }),
  adminSubmissions: (status) => request(`/admin/submissions${status ? `?status=${status}` : ''}`, { role: 'admin' }),
  reviewSubmission: (id, payload) => request(`/admin/submissions/${id}`, { method: 'PATCH', body: payload, role: 'admin' }),
};
