import { request } from './api.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase.js';

export const authService = {
  authErrorMessage,
  googleLogin: async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    try {
      return await syncUser(result.user);
    } catch (error) {
      if (error.status === 401) await signOut(auth);
      throw error;
    }
  },
  emailLogin: async (email, password) => syncUser((await signInWithEmailAndPassword(auth, email, password)).user),
  emailRegister: async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) await updateProfile(result.user, { displayName: name.trim() });
    return syncUser(result.user);
  },
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
  syncUser,
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
  logout: () => signOut(auth),
  studentDashboard: (studentId) => request(`/submissions/dashboard/${encodeURIComponent(studentId)}`, { role: 'student' }),
  mySubmissions: (studentId) => request(`/submissions?studentId=${encodeURIComponent(studentId)}`, { role: 'student' }),
  createSubmission: (payload) => request('/submissions', { method: 'POST', body: payload, role: 'student' }),
  adminSubmissions: (status) => request(`/admin/submissions${status ? `?status=${status}` : ''}`, { role: 'admin' }),
  reviewSubmission: (id, payload) => request(`/admin/submissions/${id}`, { method: 'PATCH', body: payload, role: 'admin' }),
  revokeSubmission: (id) => request(`/admin/submissions/${id}/revoke`, { method: 'POST', role: 'admin' }),
};

function authErrorMessage(error) {
  const messages = {
    'auth/operation-not-allowed': 'Email/Password chưa được bật trong Firebase Console.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/weak-password': 'Mật khẩu cần có ít nhất 6 ký tự.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  };
  return messages[error?.code] || error?.message || 'Không thể xác thực tài khoản.';
}

async function syncUser(firebaseUser) {
  const idToken = await firebaseUser.getIdToken(true);
  try {
    return await request('/auth/session', { method: 'POST', body: { idToken } });
  } catch (error) {
    if (error.status !== 404) throw error;
    return request('/auth/google', { method: 'POST', body: { idToken } });
  }
}
