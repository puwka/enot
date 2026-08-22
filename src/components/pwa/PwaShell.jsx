import { useNetworkStatus } from '../../pwa/useNetworkStatus';
import { useInstallPrompt } from '../../pwa/useInstallPrompt';
import { skipWaiting } from '../../pwa/serviceWorkerRegistration';
import './Pwa.css';

const PwaShell = ({ updateRegistration }) => {
  const { online, recentlyOnline } = useNetworkStatus();
  const { canInstall, installVisible, showIosHint, install, dismiss, dismissIosHint } = useInstallPrompt();

  return (
    <>
      {!online ? <div className="pwa-status pwa-status--offline">Нет подключения</div> : null}
      {online && recentlyOnline ? (
        <div className="pwa-status pwa-status--online">Соединение восстановлено</div>
      ) : null}

      {installVisible && canInstall ? (
        <div className="pwa-banner" role="region" aria-label="Установка приложения">
          <div className="pwa-banner__text">
            <strong>Установить приложение</strong>
            Быстрый доступ к ЕнотМани с главного экрана
          </div>
          <div className="pwa-banner__actions">
            <button type="button" className="pwa-banner__btn pwa-banner__btn--ghost" onClick={dismiss}>
              Закрыть
            </button>
            <button type="button" className="pwa-banner__btn pwa-banner__btn--primary" onClick={install}>
              Установить
            </button>
          </div>
        </div>
      ) : null}

      {showIosHint && !installVisible ? (
        <div className="pwa-banner pwa-banner--top" role="region" aria-label="Установка на iPhone">
          <div className="pwa-banner__text">
            <strong>Добавить на экран «Домой»</strong>
            В Safari: Поделиться → «На экран Домой»
          </div>
          <div className="pwa-banner__actions">
            <button type="button" className="pwa-banner__btn pwa-banner__btn--ghost" onClick={dismissIosHint}>
              Понятно
            </button>
          </div>
        </div>
      ) : null}

      {updateRegistration ? (
        <div className="pwa-banner" role="region" aria-label="Обновление приложения">
          <div className="pwa-banner__text">
            <strong>Доступна новая версия</strong>
            Обновите приложение, чтобы получить последние изменения
          </div>
          <div className="pwa-banner__actions">
            <button
              type="button"
              className="pwa-banner__btn pwa-banner__btn--primary"
              onClick={() => {
                skipWaiting();
                window.location.reload();
              }}
            >
              Обновить
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PwaShell;
