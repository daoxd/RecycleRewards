import { useEffect, useRef, useState } from 'react';
import { profileService } from '../services/profile.service.js';
import { useToast } from '../components/ToastProvider.jsx';

const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase();
const validateName = (value) => {
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 100) return 'Họ và tên cần có từ 2 đến 100 ký tự.';
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name)) return 'Họ tên chỉ nên chứa chữ cái, dấu cách, dấu nháy, dấu chấm hoặc gạch nối.';
  return '';
};

export default function Profile({ session, setSession }) {
  const [profile, setProfile] = useState(session);
  const [name, setName] = useState(session.name || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInput = useRef(null);
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    profileService.getCurrent(session.role).then((result) => {
      if (active) {
        setProfile((current) => ({ ...current, ...result }));
        setName(result.name || session.name || '');
        setError('');
      }
    }).catch((requestError) => {
      if (active) setError('Chưa tải được hồ sơ từ backend; đang hiển thị thông tin phiên đăng nhập. ' + requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [session.role, session.name]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function chooseAvatar(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Vui lòng chọn một tệp hình ảnh.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify('Ảnh đại diện cần có dung lượng tối đa 5 MB.', 'warning');
      return;
    }
    setPreview(URL.createObjectURL(file));
    notify('Ảnh chỉ đang xem trước; backend chưa cung cấp API lưu avatar.', 'info');
  }

  function cancelEdit() {
    setName(profile.name || session.name || '');
    setPreview('');
    setError('');
    setEditing(false);
  }

  async function save(event) {
    event.preventDefault();
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const updated = await profileService.updateCurrent({ name: name.trim().replace(/\s+/g, ' ') }, session.role);
      const nextProfile = { ...profile, ...updated };
      setProfile(nextProfile);
      setName(nextProfile.name);
      setSession((current) => ({ ...current, ...updated }));
      setPreview('');
      setEditing(false);
      notify('Đã cập nhật hồ sơ.', 'success');
    } catch (requestError) {
      setError(requestError.message || 'Không thể cập nhật hồ sơ.');
      notify(requestError.message || 'Không thể cập nhật hồ sơ.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const avatar = preview || profile.avatarUrl || profile.avatar || '';
  const email = profile.email || session.email || '';

  return <>
    <header className="page-header"><div><em>TÀI KHOẢN</em><h1>Hồ sơ cá nhân</h1><p>Xem và cập nhật thông tin hồ sơ của bạn.</p></div></header>
    {loading && <div className="surface dashboard-state" role="status">Đang tải hồ sơ...</div>}
    <form className="surface profile-card" onSubmit={save}>
      <div className="profile-avatar-row">
        <div className="profile-avatar" aria-label={avatar ? 'Ảnh đại diện' : 'Ký tự đại diện'}>
          {avatar ? <img src={avatar} alt="Ảnh đại diện" /> : <span>{initials(name || session.name)}</span>}
        </div>
        <div className="profile-avatar-copy"><strong>Ảnh đại diện</strong><small>{preview ? 'Ảnh xem trước — chưa được lưu lên máy chủ.' : 'Chưa có ảnh đại diện được lưu.'}</small></div>
        {editing && <>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={(event) => chooseAvatar(event.target.files && event.target.files[0])} />
          <button className="btn outline" type="button" onClick={() => fileInput.current && fileInput.current.click()}>Chọn ảnh</button>
        </>}
      </div>
      <div className="profile-fields">
        <div><label htmlFor="profile-name">Họ và tên</label>{editing
          ? <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={100} required />
          : <div className="profile-readonly">{profile.name || session.name || 'Chưa có thông tin'}</div>}</div>
        <div><label htmlFor="profile-email">Email</label><input id="profile-email" type="email" value={email} readOnly placeholder="Backend chưa cung cấp email" /><small className="field-help">Email đăng nhập chỉ có thể cập nhật khi backend hỗ trợ.</small></div>
      </div>
      {error && !loading && <div className="error-state" role="alert">{error}</div>}
      <div className="profile-actions">
        {editing ? <>
          <button className="btn outline" type="button" disabled={saving} onClick={cancelEdit}>Hủy</button>
          <button className="btn primary" type="submit" disabled={saving || loading}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
        </> : <button className="btn primary" type="button" onClick={() => { setName(profile.name || session.name || ''); setEditing(true); }}>Chỉnh sửa hồ sơ</button>}
      </div>
    </form>
  </>;
}
