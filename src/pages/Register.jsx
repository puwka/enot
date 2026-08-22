import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cabinet.css';

const Register = () => {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const referralCode = useMemo(() => params.get('ref') || '', [params]);

  if (!loading && isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const closeConfirmModal = () => setConfirmModalOpen(false);

  const goToLogin = () => {
    setConfirmModalOpen(false);
    navigate('/login', { replace: true });
  };

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
    if (!agree) {
      setError('Нужно согласие с условиями использования.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, phone, password, referralCode });
      navigate('/account', { replace: true });
    } catch (err) {
      if (err?.code === 'EMAIL_EXISTS' || err?.message === 'EMAIL_EXISTS') {
        setError('Этот email уже зарегистрирован.');
      } else if (err?.code === 'EMAIL_CONFIRM_REQUIRED') {
        setConfirmModalOpen(true);
      } else if (err?.code === 'REQUEST_FAILED') {
        setError('Сервер недоступен. Проверьте, что backend запущен.');
      } else {
        setError(err?.message || 'Не удалось создать аккаунт.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <div className="auth-card">
          <h1 className="auth-card__title">Регистрация</h1>
          <p className="auth-card__lead">Создайте аккаунт и получите доступ к бонусам и личному кабинету.</p>
          <form className="auth-form" onSubmit={onSubmit}>
            {error ? <div className="auth-form__error">{error}</div> : null}
            <label className="field">
              <span className="field__label">Имя</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label className="field">
              <span className="field__label">Телефон</span>
              <input className="input" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+7…" />
            </label>
            <label className="field">
              <span className="field__label">Пароль</span>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
            </label>
            <label className="field">
              <span className="field__label">Повтор пароля</span>
              <input className="input" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required autoComplete="new-password" />
            </label>
            {referralCode ? <p className="auth-form__hint">Реферальный код: {referralCode}</p> : null}
            <label className="auth-form__check">
              <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
              <span>
                Согласен с <Link to="/terms">условиями</Link> и <Link to="/privacy">политикой конфиденциальности</Link>
              </span>
            </label>
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? 'Создаём…' : 'Зарегистрироваться'}
            </button>
          </form>
          <div className="auth-form__links">
            <span />
            <Link to="/login">Уже есть аккаунт? Войти</Link>
          </div>
        </div>
      </div>

      {confirmModalOpen ? (
        <div className="auth-modal" role="presentation">
          <button type="button" className="auth-modal__backdrop" aria-label="Закрыть" onClick={closeConfirmModal} />
          <div
            className="auth-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-confirm-title"
          >
            <h2 id="register-confirm-title">Аккаунт создан</h2>
            <p>
              Подтвердите email по ссылке из письма, затем войдите в личный кабинет.
            </p>
            <div className="auth-modal__actions">
              <button type="button" className="btn btn--primary btn--block" onClick={goToLogin}>
                Перейти ко входу
              </button>
              <button type="button" className="btn btn--secondary btn--block" onClick={closeConfirmModal}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default Register;
