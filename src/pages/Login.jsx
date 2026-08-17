import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cabinet.css';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginValue, password);
      navigate(location.state?.from || '/account', { replace: true });
    } catch {
      setError('Неверный email или пароль.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <div className="auth-card">
          <h1 className="auth-card__title">Вход</h1>
          <p className="auth-card__lead">Войдите в личный кабинет ЕнотМани, чтобы видеть бонусы и избранное.</p>
          <form className="auth-form" onSubmit={onSubmit}>
            {error ? <div className="auth-form__error">{error}</div> : null}
            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="input"
                type="email"
                value={loginValue}
                onChange={(event) => setLoginValue(event.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label className="field">
              <span className="field__label">Пароль</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? 'Входим…' : 'Войти'}
            </button>
          </form>
          <div className="auth-form__links">
            <Link to="/forgot-password">Забыли пароль?</Link>
            <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
