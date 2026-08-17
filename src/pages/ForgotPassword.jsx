import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cabinet.css';

const ForgotPassword = () => {
  const { recoverPassword, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await recoverPassword(email);
      setDone(true);
    } catch {
      setError('Не удалось отправить письмо. Проверьте email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <div className="auth-card">
          <h1 className="auth-card__title">Восстановление пароля</h1>
          <p className="auth-card__lead">Укажите email — мы отправим ссылку для сброса пароля.</p>
          {done ? (
            <div className="auth-form">
              <p className="auth-form__hint">Если аккаунт существует, письмо со ссылкой уже отправлено.</p>
              <Link to="/login" className="btn btn--primary btn--block">
                Перейти ко входу
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={onSubmit}>
              {error ? <div className="auth-form__error">{error}</div> : null}
              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? 'Отправляем…' : 'Отправить ссылку'}
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
