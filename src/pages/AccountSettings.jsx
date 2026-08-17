import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BONUS_CONFIG } from '../config/bonuses';

const AccountSettings = () => {
  const { user, saveProfile, updatePassword, logout, removeAccount, claimBonus } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [emailNotify, setEmailNotify] = useState(Boolean(user?.notifications?.email));
  const [pushNotify, setPushNotify] = useState(Boolean(user?.notifications?.pushes));
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const onAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение для аватара.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Аватар должен быть меньше 1 МБ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ''));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await saveProfile({
        name,
        phone,
        notifications: { email: emailNotify, pushes: pushNotify },
      });
      if (name && phone) {
        await claimBonus(BONUS_CONFIG.actions.completeProfile);
      }
      setMessage('Профиль сохранён.');
    } catch {
      setError('Не удалось сохранить профиль.');
    }
  };

  const onPassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await updatePassword(currentPassword, nextPassword);
      setCurrentPassword('');
      setNextPassword('');
      setMessage('Пароль обновлён.');
    } catch {
      setError('Не удалось обновить пароль. Проверьте текущий пароль.');
    }
  };

  const onLogout = async () => {
    const ok = window.confirm('Выйти из аккаунта?');
    if (!ok) return;
    await logout();
    navigate('/login');
  };

  const onDelete = async () => {
    const ok = window.confirm('Удалить аккаунт безвозвратно?');
    if (!ok) return;
    try {
      await removeAccount();
      navigate('/register');
    } catch {
      setError('Не удалось удалить аккаунт.');
    }
  };

  return (
    <>
      <section className="cabinet-panel" style={{ marginBottom: 16 }}>
        <h2>Настройки профиля</h2>
        <form className="auth-form" onSubmit={save}>
          {message ? <p className="auth-form__hint">{message}</p> : null}
          {error ? <div className="auth-form__error">{error}</div> : null}
          <div className="cabinet-welcome" style={{ marginBottom: 4 }}>
            <div className="cabinet-avatar">
              {avatar ? <img src={avatar} alt="" /> : (name || 'U').trim().charAt(0).toUpperCase()}
            </div>
            <label className="field" style={{ flex: 1, margin: 0 }}>
              <span className="field__label">Аватар</span>
              <input className="input" type="file" accept="image/*" onChange={onAvatar} />
            </label>
          </div>
          <label className="field">
            <span className="field__label">Имя</span>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input className="input" value={user.email} readOnly />
          </label>
          <label className="field">
            <span className="field__label">Телефон</span>
            <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className="auth-form__check">
            <input type="checkbox" checked={emailNotify} onChange={(event) => setEmailNotify(event.target.checked)} />
            <span>Email-уведомления</span>
          </label>
          <label className="auth-form__check">
            <input type="checkbox" checked={pushNotify} onChange={(event) => setPushNotify(event.target.checked)} />
            <span>Push-уведомления</span>
          </label>
          <button type="submit" className="btn btn--primary">Сохранить</button>
        </form>
      </section>

      <section className="cabinet-panel" style={{ marginBottom: 16 }}>
        <h2>Смена пароля</h2>
        <form className="auth-form" onSubmit={onPassword}>
          <label className="field">
            <span className="field__label">Текущий пароль</span>
            <input className="input" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          </label>
          <label className="field">
            <span className="field__label">Новый пароль</span>
            <input className="input" type="password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} required minLength={6} />
          </label>
          <button type="submit" className="btn btn--secondary">Обновить пароль</button>
        </form>
      </section>

      <section className="cabinet-panel">
        <h2>Аккаунт</h2>
        <div className="cabinet-actions">
          <button type="button" className="btn btn--secondary" onClick={onLogout}>Выйти</button>
          <button type="button" className="btn btn--primary" onClick={onDelete}>Удалить аккаунт</button>
        </div>
      </section>
    </>
  );
};

export default AccountSettings;
