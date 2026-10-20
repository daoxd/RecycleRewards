import { verifyIdToken } from '../config/firebase.js';
import { findOrCreateGoogleUser } from '../models/user.model.js';

export async function login(req, res) {
  return firebaseSession(req, res);
}

export async function googleLogin(req, res) {
  return firebaseSession(req, res);
}

export async function firebaseSession(req, res) {
  const { idToken } = req.body || {};
  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ message: 'Thiếu Firebase ID token.' });
  }

  let decodedToken;
  try {
    decodedToken = await verifyIdToken(idToken.trim());
  } catch (error) {
    console.error(`Firebase token verification failed [${error.code || 'unknown'}]:`, error.message);
    const isConfigurationError = error.code === 'auth/configuration-error' || error.code === 'auth/invalid-credential' || error.code === 'auth/project-not-found' || error.code?.startsWith('app/');
    const message = error.code === 'auth/id-token-expired'
      ? 'Firebase ID token đã hết hạn. Hãy đăng nhập lại để cấp token mới.'
      : error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token'
        ? 'Firebase ID token không hợp lệ. Hãy đăng xuất và đăng nhập Google lại.'
        : isConfigurationError
          ? 'Backend chưa được cấu hình Firebase Admin đúng project hoặc credentials.'
          : 'Không thể xác thực Firebase ID token.';
    return res.status(isConfigurationError ? 503 : 401).json({ message });
  }

  try {
    const user = await findOrCreateGoogleUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    });
    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error(`Authenticated user persistence failed [${error.code || 'unknown'}]:`, error.message);
    return res.status(500).json({ message: 'Token hợp lệ nhưng không thể lưu tài khoản vào MongoDB.' });
  }
}
