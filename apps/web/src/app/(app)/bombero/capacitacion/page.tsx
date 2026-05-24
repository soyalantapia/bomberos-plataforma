import { SimplePage } from '../../../../components/feedback/simple-page';

export default function CapacitacionBombero() {
  return (
    <SimplePage
      title="Capacitación"
      description="Tus cursos, los disponibles y tus certificados"
      tabs={[
        {
          value: 'mis',
          label: 'Mis cursos',
          items: [
            { titulo: 'Rescate vehicular', cuerpo: 'Vence 30/9/2026', badge: { label: 'Vigente', intent: 'ok' } },
            { titulo: 'Primeros auxilios', cuerpo: 'Vence 22/5/2026', badge: { label: 'Vigente', intent: 'ok' } },
          ],
        },
        {
          value: 'disponibles',
          label: 'Disponibles',
          items: [
            { titulo: 'Rescate vehicular avanzado', cuerpo: '12 inscriptos · Escuela Federación', badge: { label: 'Abierto', intent: 'brand' } },
            { titulo: 'Manejo víctimas múltiples', cuerpo: '14 inscriptos · CEPROS Norte', badge: { label: 'Abierto', intent: 'brand' } },
            { titulo: 'Incendios estructurales II', cuerpo: '5 inscriptos · CEPROS Norte', badge: { label: 'Abierto', intent: 'brand' } },
          ],
        },
        {
          value: 'certs',
          label: 'Certificados',
          items: [
            { titulo: 'Rescate vehicular', cuerpo: 'Emitido 1/10/2024 · Folio 2024/132', badge: { label: 'PDF', intent: 'neutral' } },
            { titulo: 'Primeros auxilios', cuerpo: 'Emitido 22/5/2024 · Folio 2024/078', badge: { label: 'PDF', intent: 'neutral' } },
          ],
        },
      ]}
    />
  );
}
