'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useFaroStore } from '../store/use-faro-store';
import { perfilHomePath } from '../lib/utils/perfil';

export default function Index() {
  const router = useRouter();
  const hidratado = useFaroStore((s) => s.hidratado);
  const sesion = useFaroStore((s) => s.sesion);

  useEffect(() => {
    if (!hidratado) return;
    if (sesion) router.replace(perfilHomePath[sesion.perfilActivo]);
    else router.replace('/login');
  }, [hidratado, sesion, router]);

  return (
    <div className="min-h-dvh grid place-items-center bg-slate-50">
      <div className="h-8 w-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  );
}
