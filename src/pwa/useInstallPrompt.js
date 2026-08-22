import { useEffect, useState } from 'react';
import { dismissInstall, dismissIosHint, wasInstallDismissed, wasIosHintDismissed } from './pwaStorage';
import { isIos, isStandalone } from './serviceWorkerRegistration';

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installVisible, setInstallVisible] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return undefined;

    const onBeforeInstall = (event) => {
      if (wasInstallDismissed()) return;
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    if (isIos() && !wasIosHintDismissed()) {
      setShowIosHint(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallVisible(false);
    return true;
  };

  const closeInstall = () => {
    dismissInstall();
    setInstallVisible(false);
  };

  const closeIosHint = () => {
    dismissIosHint();
    setShowIosHint(false);
  };

  return {
    canInstall: Boolean(deferredPrompt),
    installVisible,
    showIosHint,
    install,
    dismiss: closeInstall,
    dismissIosHint: closeIosHint,
  };
};
