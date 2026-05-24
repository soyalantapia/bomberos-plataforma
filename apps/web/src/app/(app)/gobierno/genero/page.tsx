import { BookHeart, FileLock2, Heart, PhoneCall, ShieldAlert } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function GeneroPage() {
  return (
    <SimplePage
      objetivo="Gobierno interno · Género"
      title="Canal confidencial · perspectiva de género"
      description="Atención y registro con confidencialidad reforzada. Acceso aún más restringido que el resto de Ética."
      icono={<Heart size={26} />}
      variant="critical"
      intro={{
        titulo: '🔒 Canal confidencial reforzado',
        cuerpo:
          'Solo Referente de Género (Florencia Salinas) y Coordinadora Federación ven las denuncias. Identidad del denunciante cifrada con clave de la denunciante.',
      }}
      kpis={[
        { label: 'Activas', value: 0, hint: 'sin novedades', intent: 'ok' },
        { label: 'Año en curso', value: 1, hint: 'cerrada con resolución', intent: 'neutral' },
        { label: 'Recursos', value: 3, hint: 'protocolos vigentes', icon: <BookHeart size={16} /> },
        {
          label: 'Cifrado',
          value: 'E2E',
          hint: 'identidad protegida',
          icon: <FileLock2 size={16} />,
        },
      ]}
      tabs={[
        {
          value: 'denuncias',
          label: 'Canal',
          items: [
            {
              titulo: 'Canal abierto y operativo',
              cuerpo:
                'Sin denuncias activas este mes. La referente de género recibe alertas inmediatas.',
              badge: { label: 'Sin novedades', intent: 'ok' },
              icon: <ShieldAlert size={16} />,
            },
          ],
        },
        {
          value: 'docs',
          label: 'Protocolos',
          items: [
            {
              titulo: 'Protocolo de actuación · v2026',
              cuerpo: 'PDF · vigente desde 1/3 · firmado Federación',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <BookHeart size={16} />,
            },
            {
              titulo: 'Guía de prevención',
              cuerpo: 'PDF · 24 páginas · obligatoria para nuevo personal',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <BookHeart size={16} />,
            },
            {
              titulo: 'Formulario de denuncia',
              cuerpo: 'PDF rellenable · descargable · permite anonimato parcial',
              badge: { label: 'Descargable', intent: 'neutral' },
              icon: <BookHeart size={16} />,
            },
          ],
        },
        {
          value: 'recursos',
          label: 'Recursos',
          items: [
            {
              titulo: 'Línea 144 (Ministerio Nacional)',
              cuerpo: 'Atención 24/7 · gratuita · derivación a redes locales',
              badge: { label: '24/7', intent: 'brand' },
              icon: <PhoneCall size={16} />,
            },
            {
              titulo: 'Servicio de orientación interno',
              cuerpo: 'Florencia Salinas · vía chat interno o presencial · jueves 18-20h',
              badge: { label: 'Cita previa', intent: 'neutral' },
              icon: <Heart size={16} />,
            },
          ],
        },
      ]}
    />
  );
}
