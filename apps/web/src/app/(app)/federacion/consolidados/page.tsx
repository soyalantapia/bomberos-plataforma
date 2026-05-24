import { Activity, Award, BarChart3, Users } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function ConsolidadosFed() {
  return (
    <SimplePage
      objetivo="Federación · Consolidados"
      title="Agregados regionales · Norte GBA"
      description="Lo que en GIB hay que armar a mano por cuartel, acá ya está sumado al instante."
      icono={<BarChart3 size={26} />}
      kpis={[
        { label: 'Cuarteles', value: 4, hint: 'en la región', intent: 'brand' },
        { label: 'Personal activo', value: 236, hint: 'agregado', icon: <Users size={16} /> },
        { label: 'Servicios mes', value: 42, hint: 'mayo 2026', icon: <Activity size={16} /> },
        { label: 'Certificados mes', value: 32, intent: 'ok', icon: <Award size={16} /> },
      ]}
      tabs={[
        {
          value: 'personal',
          label: 'Personal',
          items: [
            {
              titulo: 'Total activos región',
              cuerpo: '236 personas en 4 cuarteles · +3% vs mes anterior',
              badge: { label: '236', intent: 'brand' },
            },
            { titulo: 'Cadetes', cuerpo: '28 en formación', badge: { label: '28', intent: 'ok' } },
            { titulo: 'Comandantes', cuerpo: '4 (uno por cuartel)' },
            {
              titulo: 'Mujeres en jerarquías de mando',
              cuerpo: '7 personas · 38% del mando regional',
              badge: { label: '38%', intent: 'brand' },
            },
            {
              titulo: 'Aptitudes médicas vigentes',
              cuerpo: '224 al día · 12 por renovar próximo mes',
              badge: { label: '95%', intent: 'ok' },
            },
          ],
        },
        {
          value: 'serv',
          label: 'Servicios',
          items: [
            {
              titulo: 'Total servicios región mayo',
              cuerpo: '42 servicios · +18% vs mayo 2025',
              badge: { label: '42', intent: 'brand' },
            },
            {
              titulo: 'Incendios estructurales',
              cuerpo: '14 servicios · principal causa mayo',
              badge: { label: '14', intent: 'risk' },
            },
            {
              titulo: 'Rescates',
              cuerpo: '11 servicios · 4 con personas atrapadas',
              badge: { label: '11', intent: 'warn' },
            },
            {
              titulo: 'Accidentes vehiculares',
              cuerpo: '9 servicios · 3 con heridos graves',
              badge: { label: '9' },
            },
            {
              titulo: 'Forestales',
              cuerpo: '5 servicios · zona ribereña activa',
              badge: { label: '5', intent: 'ok' },
            },
            {
              titulo: 'Otros',
              cuerpo: '3 servicios · alarmas, asistencia general',
              badge: { label: '3' },
            },
          ],
        },
        {
          value: 'cap',
          label: 'Capacitación',
          items: [
            {
              titulo: 'Cursos en marcha región',
              cuerpo: '8 cursos · 124 inscriptos en total',
              badge: { label: '8', intent: 'brand' },
            },
            {
              titulo: 'Certificados emitidos mayo',
              cuerpo: '32 certificados · folios 2026/04 y 2026/05',
              badge: { label: '32', intent: 'ok' },
            },
            {
              titulo: 'Próxima evaluación regional',
              cuerpo: '12/6/2026 · CEPROS Norte · rescate vehicular avanzado',
              badge: { label: '12/6', intent: 'warn' },
            },
          ],
        },
      ]}
    />
  );
}
