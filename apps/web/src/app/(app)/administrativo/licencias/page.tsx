import { CalendarCheck, ClipboardCheck, FileCheck } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function LicenciasNovedades() {
  return (
    <SimplePage
      objetivo="Administrativo · Licencias"
      title="Solicitudes, otorgadas e importación externa"
      description="Gestión de licencias del cuartel. Las solicitudes pasan al flujo de Aprobaciones del Mando (doble check + audit)."
      icono={<CalendarCheck size={26} />}
      kpis={[
        { label: 'Pendientes', value: 2, hint: 'esperan aprobación', intent: 'warn' },
        { label: 'Otorgadas mes', value: 2, hint: 'mayo 2026', intent: 'ok' },
        { label: 'Sync externo', value: 'Aquarii', hint: 'última 21/5', intent: 'brand' },
      ]}
      tabs={[
        {
          value: 'solicitudes',
          label: 'Solicitudes',
          items: [
            {
              titulo: 'Iván Quiroga · Licencia médica',
              cuerpo: '7 días desde 15/5 · cirugía menor',
              badge: { label: 'Pendiente', intent: 'warn' },
              icon: <ClipboardCheck size={16} />,
            },
            {
              titulo: 'Camila Torres · Licencia académica',
              cuerpo: '1 día · examen final · 20/5',
              badge: { label: 'Pendiente', intent: 'warn' },
              icon: <ClipboardCheck size={16} />,
            },
          ],
          emptyText: 'No hay solicitudes pendientes. ¡Bien!',
        },
        {
          value: 'otorgadas',
          label: 'Otorgadas',
          items: [
            {
              titulo: 'Florencia Salinas · Académica',
              cuerpo: 'Otorgada el 8/5 por Roberto González',
              badge: { label: 'Aprobada', intent: 'ok' },
              icon: <FileCheck size={16} />,
            },
            {
              titulo: 'Bruno Acosta · Médica',
              cuerpo: 'Otorgada el 2/5 por Mariana Pereyra',
              badge: { label: 'Aprobada', intent: 'ok' },
              icon: <FileCheck size={16} />,
            },
          ],
        },
        {
          value: 'import',
          label: 'Importación',
          items: [
            {
              titulo: 'Aquarii · sistema externo',
              cuerpo: 'Última sincronización: 21/5 a las 03:00 · 12 novedades importadas',
              badge: { label: 'OK', intent: 'ok' },
            },
          ],
        },
      ]}
    />
  );
}
