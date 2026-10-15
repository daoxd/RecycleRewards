import { createFirebaseUser, deleteFirebaseUser, updateFirebaseUser } from '../config/firebase.js';
import { User } from '../models/user.model.js';

function publicUser(user) {
  return user.toJSON();
}

function withTimeout(promise, operation, timeoutMs = 10000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`${operation} quá thời gian chờ.`);
        error.status = 503;
        reject(error);
      }, timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

export async function listUsers(req, res) {
  const query = String(req.query.search || '').trim();
  const filter = query ? { $or: [{ name: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }, { studentId: new RegExp(query, 'i') }] } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users.map(publicUser));
}

export async function createUser(req, res) {
  const { name, email, password, role = 'student', studentId, school } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Tên, email và mật khẩu là bắt buộc.' });
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
  if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu cần có ít nhất 6 ký tự.' });

  let firebaseUser;
  try {
    firebaseUser = await withTimeout(createFirebaseUser({ email: email.trim(), password, displayName: name.trim() }), 'Firebase Admin');
    const user = await withTimeout(User.create({
      firebaseUid: firebaseUser.uid,
      email: email.trim(),
      name: name.trim(),
      studentId: studentId?.trim() || firebaseUser.uid,
      school: school?.trim() || 'Đại học Công nghệ GTVT',
      role,
    }), 'MongoDB');
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (firebaseUser) deleteFirebaseUser(firebaseUser.uid).catch((cleanupError) => console.error('Firebase cleanup failed:', cleanupError.message));
    if (error.code === 11000 || error.code === 'auth/email-already-exists') return res.status(409).json({ message: 'Email hoặc mã người dùng đã tồn tại.' });
    throw error;
  }
}

export async function updateUser(req, res) {
  const { name, email, password, role, studentId, school } = req.body || {};
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  if (req.user._id.equals(user._id) && role === 'student') return res.status(400).json({ message: 'Không thể tự hạ quyền tài khoản đang đăng nhập.' });
  if (role && !['student', 'admin'].includes(role)) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
  if (password && password.length < 6) return res.status(400).json({ message: 'Mật khẩu cần có ít nhất 6 ký tự.' });

  const firebaseUpdate = {};
  if (email?.trim()) firebaseUpdate.email = email.trim();
  if (password) firebaseUpdate.password = password;
  if (name?.trim()) firebaseUpdate.displayName = name.trim();
  await updateFirebaseUser(user.firebaseUid, firebaseUpdate);

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = email.trim();
  if (role !== undefined) user.role = role;
  if (studentId !== undefined) user.studentId = studentId.trim();
  if (school !== undefined) user.school = school.trim();
  await user.save();
  res.json({ user: publicUser(user) });
}

export async function deleteUser(req, res) {
  if (req.user._id.toString() === req.params.id) return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  await deleteFirebaseUser(user.firebaseUid).catch((error) => {
    if (error.code !== 'auth/user-not-found') throw error;
  });
  await User.deleteOne({ _id: user._id });
  res.status(204).end();
}
