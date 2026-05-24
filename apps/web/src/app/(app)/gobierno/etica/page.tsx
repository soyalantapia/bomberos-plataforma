import { SimplePage } from '../../../../components/feedback/simple-page';

export default function EticaPage() {
  return (
    <SimplePage
      title="Ética"
      description="Denuncias, actos administrativos y seguimiento"
      intro={{
        titulo: '🔐 Acceso restringido y trazable',
        cuerpo: 'Todo lo que pase por acá queda en el audit log. Acceso limitado a roles asignados.',
      }}
      tabs={[
        { value: 'denuncias', label: 'Denuncias', items: [
          { titulo: 'Expediente E-2026-014', cuerpo: 'En seguimiento · jefatura informada', badge: { label: 'Activo', intent: 'warn' } },
          { titulo: 'Expediente E-2026-013', cuerpo: 'Cerrado · resolución 5/5/2026', badge: { label: 'Cerrado', intent: 'neutral' } },
        ]},
        { value: 'ordenes', label: 'Órdenes de jefatura', items: [
          { titulo: 'Orden N° 12/26', cuerpo: 'Renovación protocolo Pañol' },
          { titulo: 'Orden N° 11/26', cuerpo: 'Calendario de capacitación' },
        ]},
        { value: 'seguimiento', label: 'Seguimiento', items: [
          { titulo: 'E-2026-014 · Próxima audiencia', cuerpo: '3/6/2026 · Sala de jefatura' },
        ]},
      ]}
    />
  );
}
