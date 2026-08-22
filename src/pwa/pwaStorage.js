export const PWA_INSTALL_DISMISSED_KEY = 'enotmani-pwa-install-dismissed';
export const PWA_IOS_HINT_DISMISSED_KEY = 'enotmani-pwa-ios-hint-dismissed';

export const wasInstallDismissed = () => localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === '1';

export const dismissInstall = () => localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1');

export const wasIosHintDismissed = () => localStorage.getItem(PWA_IOS_HINT_DISMISSED_KEY) === '1';

export const dismissIosHint = () => localStorage.setItem(PWA_IOS_HINT_DISMISSED_KEY, '1');
