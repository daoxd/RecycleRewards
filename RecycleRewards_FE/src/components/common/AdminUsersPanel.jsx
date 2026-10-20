import { useEffect, useState } from 'react';
import { adminUserService } from '../../services/adminUser.service.js';
import { useToast } from '../ToastProvider.jsx';

const emptyForm = { name: '', email: '', password: '', role: 'student', studentId: '', school: '' };

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  async function loadUsers(value = search) {
    setLoading(true);
    try { setUsers(await adminUserService.list(value)); } catch (error) { notify(error.message, 'error'); } finally { setLoading(false); }
  }

  useEffect(() => { loadUsers(''); }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
  }

  function editUser(user) {
    setEditingId(user.id);
    setForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'student', studentId: user.studentId || '', school: user.school || '' });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete payload.password;
      if (editingId) await adminUserService.update(editingId, payload);
      else await adminUserService.create(payload);
      notify(editingId ? 'Đã cập nhật người dùng.' : 'Đã tạo người dùng.', 'success');
      resetForm();
      await loadUsers();
    } catch (error) { notify(error.message, 'error'); } finally { setSaving(false); }
  }

  async function removeUser(user) {
    if (!window.confirm(`Xóa tài khoản ${user.email || user.name}?`)) return;
    try { await adminUserService.remove(user.id); notify('Đã xóa người dùng.', 'success'); await loadUsers(); } catch (error) { notify(error.message, 'error'); }
  }

  return <section className="admin-users-layout">
    <form className="surface admin-user-form" onSubmit={save}>
      <div className="section-heading"><div><h2>{editingId ? 'Chỉnh sửa người dùng' : 'Tạo người dùng'}</h2><p>{editingId ? 'Cập nhật thông tin và quyền truy cập.' : 'Tạo tài khoản Firebase và hồ sơ MongoDB.'}</p></div></div>
      <label htmlFor="user-name">Họ và tên</label><input id="user-name" name="name" value={form.name} onChange={updateField} required />
      <label htmlFor="user-email">Email</label><input id="user-email" name="email" type="email" value={form.email} onChange={updateField} required />
      <label htmlFor="user-password">Mật khẩu {editingId && '(để trống nếu không đổi)'}</label><input id="user-password" name="password" type="password" minLength={6} value={form.password} onChange={updateField} required={!editingId} />
      <label htmlFor="user-role">Vai trò</label><select id="user-role" name="role" value={form.role} onChange={updateField}><option value="student">Học sinh</option><option value="admin">Quản trị viên</option></select>
      <label htmlFor="user-student-id">Mã người dùng</label><input id="user-student-id" name="studentId" value={form.studentId} onChange={updateField} placeholder="HS-2026-001" />
      <label htmlFor="user-school">Trường</label><input id="user-school" name="school" value={form.school} onChange={updateField} />
      <div className="profile-actions"><button className="btn outline" type="button" onClick={resetForm} disabled={saving}>Hủy</button><button className="btn primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button></div>
    </form>
    <section className="surface admin-user-list">
      <div className="section-heading"><div><h2>Người dùng</h2><p>{users.length} tài khoản trong hệ thống</p></div><button className="btn outline" type="button" onClick={() => loadUsers()}>Làm mới</button></div>
      <input value={search} onChange={(event) => { setSearch(event.target.value); loadUsers(event.target.value); }} placeholder="Tìm theo tên, email hoặc mã..." />
      {loading ? <div className="dashboard-state">Đang tải người dùng...</div> : users.length ? <div className="admin-user-table">{users.map((user) => <article className="admin-user-row" key={user.id}><div><strong>{user.name}</strong><small>{user.email} · {user.studentId}</small></div><span className={'pill ' + user.role}>{user.role === 'admin' ? 'Quản trị viên' : 'Học sinh'}</span><div className="admin-user-actions"><button className="btn outline" type="button" onClick={() => editUser(user)}>Sửa</button><button className="btn danger" type="button" onClick={() => removeUser(user)}>Xóa</button></div></article>)}</div> : <div className="empty"><strong>Chưa có người dùng</strong><span>Tạo tài khoản đầu tiên ở biểu mẫu bên cạnh.</span></div>}
    </section>
  </section>;
}
