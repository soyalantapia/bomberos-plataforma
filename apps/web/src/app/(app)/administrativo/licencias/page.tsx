import { SimplePage } from '../../../../components/feedback/simple-page';

export default function LicenciasNovedades() {
  return (
    <SimplePage
      title="Licencias y novedades"
      description="Solicitudes y aprobaciones del cuartel"
      tabs={[
        {
          value: 'solicitudes',
          label: 'Solicitudes',
          items: [
            { titulo: 'Iván Quiroga · Licencia médica', cuerpo: '7 días desde 15/5', badge: { label: 'Pendiente', intent: 'warn' } },
            { titulo: 'Camila Torres · Académica', cuerpo: '1 día · 20/5', badge: { label: 'Pendiente', intent: 'warn' } },
          ],
        },
        {
          value: 'otorgadas',
          label: 'Otorgadas',
          items: [
            { titulo: 'Florencia Salinas · Académica', cuerpo: 'Otorgada el 8/5', badge: { label: 'Aprobada', intent: 'ok' } },
            { titulo: 'Bruno Acosta · Médica', cuerpo: 'Otorgada el 2/5', badge: { label: 'Aprobada', intent: 'ok' } },
          ],
        },
        {
          value: 'import',
          label: 'Importación',
          items: [
            { titulo: 'Aquarii (sistema externo)', cuerpo: 'Última sincronización: 21/5', badge: { label: 'OK', intent: 'ok' } },
          ],
        },
      ]}
    />
  );
}
