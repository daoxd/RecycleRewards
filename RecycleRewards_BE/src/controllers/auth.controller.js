import { verifyIdToken } from '../config/firebase.js';
import { adminProfile, findOrCreateGoogleUser, studentProfile } from '../models/user.model.js';

export function login(req, res) {
  const { role = 'student', studentId } = req.body;
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
  const base = role === 'admin' ? adminProfile : studentProfile;
  const user = { ...base, studentId: String(studentId || base.studentId).trim() || base.studentId };
  res.json({ token: `mock-${role}-token`, user });
}

export async function googleLogin(req, res) {
  const { idToken } = req.body || {};
  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ message: 'Thiếu Firebase ID token.' });
  }

  try {
    const decodedToken = await verifyIdToken(idToken);
    const user = findOrCreateGoogleUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    });
    return res.json({ user });
  } catch (error) {
    console.error('Google authentication failed:', error.message);
    const isConfigurationError = error.code === 'auth/configuration-error' || error.code?.startsWith('app/');
    return res.status(isConfigurationError ? 503 : 401).json({
      message: isConfigurationError ? 'Backend chưa được cấu hình Firebase Admin.' : 'Firebase ID token không hợp lệ hoặc đã hết hạn.',
    });
  }
}
