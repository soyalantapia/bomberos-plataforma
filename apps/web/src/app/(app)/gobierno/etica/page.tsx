import { FileLock2, Gavel, ShieldAlert, ShieldCheck } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function EticaPage() {
  return (
    <SimplePage
      objetivo="Gobierno interno · Ética"
      title="Denuncias, expedientes y órdenes"
      description="Acceso restringido a roles asignados. Todo lo que pasa por acá queda en el audit log con cifrado a nivel campo."
      icono={<Gavel size={26} />}
      variant="critical"
      intro={{
        titulo: '🔐 Acceso restringido y trazable',
        cuerpo:
          'Solo Referente de Ética, Comandante y Coordinadora Federación pueden abrir esta sección. Todo movimiento queda firmado y sellado en Audit log.',
      }}
      kpis={[
        {
          label: 'Expedientes activos',
          value: 1,
          hint: 'en seguimiento',
          intent: 'warn',
          icon: <ShieldAlert size={16} />,
        },
        {
          label: 'Cerrados año',
          value: 8,
          hint: 'con resolución',
          intent: 'ok',
          icon: <ShieldCheck size={16} />,
        },
        { label: 'Órdenes vigentes', value: 12, hint: 'de jefatura' },
        {
          label: 'Cifrado',
          value: 'AES-256',
          hint: 'a nivel campo',
          icon: <FileLock2 size={16} />,
        },
      ]}
      tabs={[
        {
          value: 'denuncias',
          label: 'Denuncias',
          items: [
            {
              titulo: 'Expediente E-2026-014',
              cuerpo: 'En seguimiento · próx. audiencia 3/6 · jefatura informada',
              badge: { label: 'Activo', intent: 'warn' },
              icon: <ShieldAlert size={16} />,
            },
            {
              titulo: 'Expediente E-2026-013',
              cuerpo: 'Cerrado · resolución 5/5/2026 · sin sanción',
              badge: { label: 'Cerrado', intent: 'neutral' },
            },
          ],
        },
        {
          value: 'ordenes',
          label: 'Órdenes',
          items: [
            {
              titulo: 'Orden N° 12/26',
              cuerpo: 'Renovación protocolo Pañol · firmada por Comandante 18/5',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <Gavel size={16} />,
            },
            {
              titulo: 'Orden N° 11/26',
              cuerpo: 'Calendario de capacitación H2 2026',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <Gavel size={16} />,
            },
          ],
        },
        {
          value: 'seguimiento',
          label: 'Seguimiento',
          items: [
            {
              titulo: 'E-2026-014 · Próxima audiencia',
              cuerpo: '3/6/2026 · 18:00 · Sala de jefatura · presidida por F. Salinas',
              badge: { label: 'Agendada', intent: 'warn' },
            },
          ],
        },
      ]}
    />
  );
}
