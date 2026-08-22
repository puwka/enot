import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [recentlyOnline, setRecentlyOnline] = useState(false);

  useEffect(() => {
    let timerId = null;

    const onOnline = () => {
      setOnline(true);
      setRecentlyOnline(true);
      if (timerId) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => setRecentlyOnline(false), 2800);
    };

    const onOffline = () => {
      setOnline(false);
      setRecentlyOnline(false);
      if (timerId) window.clearTimeout(timerId);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  return { online, recentlyOnline };
};
