import { Award, GraduationCap } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function CapacitacionBombero() {
  return (
    <SimplePage
      objetivo="Tu capacitación"
      title="Cursos, certificados y vencimientos"
      description="Mantené tu formación al día. La aptitud para servicios depende de tus cursos vigentes."
      icono={<GraduationCap size={26} />}
      kpis={[
        { label: 'Cursos vigentes', value: 2, intent: 'ok', icon: <Award size={16} /> },
        { label: 'Por vencer', value: 1, hint: '< 30d', intent: 'warn' },
        { label: 'Disponibles', value: 3, hint: 'abiertos a inscripción', intent: 'brand' },
        { label: 'Certificados', value: 2, hint: 'descargables' },
      ]}
      searchable
      tabs={[
        {
          value: 'mis',
          label: 'Mis cursos',
          items: [
            {
              titulo: 'Rescate vehicular',
              cuerpo: 'Vence 30/9/2026 · Escuela Federación',
              badge: { label: 'Vigente', intent: 'ok' },
            },
            {
              titulo: 'Primeros auxilios',
              cuerpo: 'Vence 22/5/2026',
              badge: { label: 'Por vencer', intent: 'warn' },
            },
          ],
        },
        {
          value: 'disponibles',
          label: 'Abiertos',
          items: [
            {
              titulo: 'Rescate vehicular avanzado',
              cuerpo: '12 inscriptos · 16 cupos · Escuela Federación',
              badge: { label: 'Inscribirme', intent: 'brand' },
            },
            {
              titulo: 'Manejo de víctimas múltiples',
              cuerpo: '14 inscriptos · CEPROS Norte',
              badge: { label: 'Inscribirme', intent: 'brand' },
            },
            {
              titulo: 'Incendios estructurales II',
              cuerpo: '5 inscriptos · CEPROS Norte',
              badge: { label: 'Inscribirme', intent: 'brand' },
            },
          ],
        },
        {
          value: 'certs',
          label: 'Certificados',
          items: [
            {
              titulo: 'Rescate vehicular',
              cuerpo: 'Emitido 1/10/2024 · Folio 2024/132',
              badge: { label: 'Descargar PDF', intent: 'neutral' },
            },
            {
              titulo: 'Primeros auxilios',
              cuerpo: 'Emitido 22/5/2024 · Folio 2024/078',
              badge: { label: 'Descargar PDF', intent: 'neutral' },
            },
          ],
        },
      ]}
    />
  );
}
