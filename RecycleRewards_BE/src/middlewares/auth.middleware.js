import { verifyIdToken } from '../config/firebase.js';
import { findOrCreateGoogleUser } from '../models/user.model.js';

export async function requireAuth(req, res, next) {
  const authorization = req.header('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Bạn cần đăng nhập để tiếp tục.' });

  try {
    const decodedToken = await verifyIdToken(token);
    req.user = await findOrCreateGoogleUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    });
    next();
  } catch (error) {
    console.error('Authorization failed:', error.message);
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  next();
};
