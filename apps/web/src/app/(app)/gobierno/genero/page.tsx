'use client';

import { BookHeart, Eye, FileLock2, Heart, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

const recursos = [
  {
    titulo: 'Línea 144',
    subtitulo: 'Ministerio de Mujeres · Nación',
    descripcion: 'Atención 24/7 · gratuita · derivación a redes locales según ubicación.',
    color: 'from-status-risk to-rose-700',
    cta: 'Llamar al 144',
    icono: <PhoneCall size={20} />,
  },
  {
    titulo: 'Servicio de orientación',
    subtitulo: 'Florencia Salinas · Cuartel',
    descripcion: 'Chat interno o presencial · jueves 18-20h · confidencialidad absoluta.',
    color: 'from-brand-600 to-brand-800',
    cta: 'Abrir chat privado',
    icono: <Heart size={20} />,
  },
];

const protocolos = [
  {
    titulo: 'Protocolo de actuación',
    subtitulo: 'v2026 · Federación',
    tamano: '24 páginas',
    actualizado: '1/3/2026',
  },
  {
    titulo: 'Guía de prevención',
    subtitulo: 'Obligatoria nuevo personal',
    tamano: '18 páginas',
    actualizado: '15/2/2026',
  },
  {
    titulo: 'Formulario denuncia',
    subtitulo: 'PDF rellenable · permite anonimato parcial',
    tamano: '3 páginas',
    actualizado: '10/4/2026',
  },
];

export default function GeneroPage() {
  const toast = useToast();
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Gobierno interno · Género"
        titulo="Canal confidencial reforzado"
        descripcion="Acceso aún más restringido que Ética. Identidad cifrada con clave de la denunciante."
        icono={<Heart size={26} />}
        variant="critical"
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Activas" value={0} hint="sin novedades" intent="ok" />
            <Kpi label="Cerradas año" value={1} hint="con resolución" />
            <Kpi
              label="Cifrado"
              value="E2E"
              hint="identidad protegida"
              intent="ok"
              icon={<FileLock2 size={16} />}
            />
            <Kpi
              label="Acceso"
              value="2 personas"
              hint="Referente + Fed"
              intent="warn"
              icon={<Eye size={16} />}
            />
          </div>
        }
      />

      <Card className="overflow-hidden border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose-700" />
            <span className="font-bold text-rose-900">Canal confidencial</span>
            <Badge intent="risk">E2E</Badge>
          </div>
          <p className="text-sm text-slate-700">
            Las denuncias por género tienen el nivel más alto de protección de Faro. La identidad
            del denunciante se cifra con su propia clave. Solo la referente de género del cuartel
            (Florencia Salinas) y la Coordinadora Regional (Patricia Morales) pueden abrir un
            expediente.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                toast.push({
                  kind: 'info',
                  title: 'Iniciando denuncia confidencial',
                  description: 'Se cifra con tu clave personal antes de subir.',
                })
              }
              className="rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-800"
            >
              Iniciar denuncia confidencial
            </button>
            <button
              type="button"
              onClick={() =>
                toast.push({
                  kind: 'info',
                  title: 'Anonimato parcial',
                  description: 'Tus datos quedan cifrados; solo se libera con tu OTP.',
                })
              }
              className="rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Hacer consulta anónima
            </button>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Sparkles size={18} className="text-rose-600" /> Recursos disponibles ahora
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {recursos.map((r) => (
            <div
              key={r.titulo}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-md ${r.color}`}
            >
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  {r.icono}
                </div>
                <div className="text-2xl font-bold leading-tight">{r.titulo}</div>
                <div className="mt-1 text-sm text-white/85">{r.subtitulo}</div>
                <p className="mt-3 text-sm text-white/90">{r.descripcion}</p>
                <button
                  type="button"
                  onClick={() => toast.push({ kind: 'info', title: r.cta })}
                  className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-white"
                >
                  {r.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <BookHeart size={18} className="text-slate-700" /> Protocolos y formularios
        </h2>
        <div className="space-y-2">
          {protocolos.map((p) => (
            <button
              key={p.titulo}
              type="button"
              onClick={() =>
                toast.push({ kind: 'info', title: 'Descargando', description: p.titulo })
              }
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <BookHeart size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{p.titulo}</div>
                <div className="mt-0.5 text-xs text-slate-600">{p.subtitulo}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>{p.tamano}</div>
                <div className="mt-0.5">{p.actualizado}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
