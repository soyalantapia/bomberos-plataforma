'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div role="status" className="sticky top-0 z-40 w-full text-sm px-4 py-2 flex items-center gap-2 justify-center bg-status-warn-bg text-status-warn-fg">
      <WifiOff size={16} />
      <span>Sin señal — lo que cargues se guarda y se sincroniza solo cuando vuelva</span>
    </div>
  );
}
