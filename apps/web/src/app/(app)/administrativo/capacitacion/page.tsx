import { Award, Building2, GraduationCap, Layers } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function CapacitacionGestion() {
  return (
    <SimplePage
      objetivo="Administrativo · Capacitación"
      title="Cursos, centros y acreditaciones GIB-equivalentes"
      description="Catálogo de cursos, CEPROS, categorías y folios de acreditación que se mandan a la Federación."
      icono={<GraduationCap size={26} />}
      kpis={[
        {
          label: 'Cursos abiertos',
          value: 3,
          hint: '31 inscriptos',
          intent: 'brand',
          icon: <Award size={16} />,
        },
        { label: 'CEPROS', value: 2, hint: 'centros activos', icon: <Building2 size={16} /> },
        { label: 'Categorías', value: 3, hint: 'taxonomía', icon: <Layers size={16} /> },
        { label: 'Folios mes', value: 2, hint: '20 certificados', intent: 'ok' },
      ]}
      tabs={[
        {
          value: 'cursos',
          label: 'Cursos',
          items: [
            {
              titulo: 'Rescate vehicular avanzado',
              cuerpo: '12 inscriptos · 16 cupos · Federación',
              badge: { label: 'Abierto', intent: 'ok' },
              icon: <Award size={16} />,
            },
            {
              titulo: 'Manejo víctimas múltiples',
              cuerpo: '14 inscriptos · CEPROS Norte',
              badge: { label: 'Abierto', intent: 'ok' },
              icon: <Award size={16} />,
            },
            {
              titulo: 'Incendios estructurales II',
              cuerpo: '5 inscriptos · CEPROS Norte · faltan 3 cupos',
              badge: { label: 'Abierto', intent: 'ok' },
              icon: <Award size={16} />,
            },
          ],
        },
        {
          value: 'cepros',
          label: 'CEPROS',
          items: [
            {
              titulo: 'CEPROS Norte GBA',
              cuerpo: 'San Martín · capacidad 32 personas · próx. evaluación 12/6',
              icon: <Building2 size={16} />,
            },
            {
              titulo: 'CEPROS Tigre',
              cuerpo: 'Tigre · capacidad 24 personas',
              icon: <Building2 size={16} />,
            },
          ],
        },
        {
          value: 'cats',
          label: 'Categorías',
          items: [
            {
              titulo: 'Operativos · rescate',
              cuerpo: '4 cursos vigentes · Bombero 1ra y superior',
              badge: { label: '4', intent: 'brand' },
            },
            {
              titulo: 'Operativos · incendio',
              cuerpo: '3 cursos vigentes · Todos los rangos',
              badge: { label: '3', intent: 'brand' },
            },
            {
              titulo: 'Administrativos',
              cuerpo: '2 cursos vigentes · Padrón y gestión',
              badge: { label: '2', intent: 'brand' },
            },
          ],
        },
        {
          value: 'acred',
          label: 'Acreditaciones',
          items: [
            {
              titulo: 'Folio 2026/04 emitido',
              cuerpo: '8 certificados · Federación · firmado por Patricia Morales',
              badge: { label: 'Emitido', intent: 'ok' },
            },
            {
              titulo: 'Folio 2026/03 emitido',
              cuerpo: '12 certificados · Federación · marzo',
              badge: { label: 'Emitido', intent: 'ok' },
            },
          ],
        },
      ]}
    />
  );
}
