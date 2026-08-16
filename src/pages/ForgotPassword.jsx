import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cabinet.css';

const ForgotPassword = () => {
  const { recoverPassword, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов.');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }
    setSubmitting(true);
    try {
      await recoverPassword(email, password);
      setDone(true);
    } catch {
      setError('Аккаунт с таким email не найден.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <div className="auth-card">
          <h1 className="auth-card__title">Восстановление пароля</h1>
          <p className="auth-card__lead">Укажите email аккаунта и задайте новый пароль.</p>
          {done ? (
            <div className="auth-form">
              <p className="auth-form__hint">Пароль обновлён. Теперь можно войти с новыми данными.</p>
              <Link to="/login" className="btn btn--primary btn--block">
                Перейти ко входу
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={onSubmit}>
              {error ? <div className="auth-form__error">{error}</div> : null}
              <label className="field">
                <span className="field__label">Email</span>
                <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="field">
                <span className="field__label">Новый пароль</span>
                <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <label className="field">
                <span className="field__label">Повтор пароля</span>
                <input className="input" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
              </label>
              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? 'Сохраняем…' : 'Обновить пароль'}
              </button>
            </form>
          )}
          <div className="auth-form__links">
            <Link to="/login">Вернуться ко входу</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
