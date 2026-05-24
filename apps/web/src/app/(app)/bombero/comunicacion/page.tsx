import { SimplePage } from '../../../../components/feedback/simple-page';

export default function ComunicacionPage() {
  return (
    <SimplePage
      title="Comunicación"
      description="Avisos del cuartel y chat interno"
      tabs={[
        {
          value: 'avisos',
          label: 'Avisos',
          items: [
            { titulo: 'Curso de rescate vehicular', cuerpo: 'Inscripción abierta hasta el 30/5.' },
            { titulo: 'Mantenimiento Móvil BV-5', cuerpo: 'Mañana de 8 a 12 hs.' },
            { titulo: 'Donación de sangre', cuerpo: 'Sábado 25/5 · Hospital Municipal.' },
          ],
        },
        {
          value: 'chat',
          label: 'Chat',
          items: [
            { titulo: 'Cuartel general', cuerpo: 'Mariana: Mañana 7am en Pueyrredón.', badge: { label: 'Hoy', intent: 'brand' } },
            { titulo: 'Sección Operativa', cuerpo: 'Roberto: Bien hecho con lo del incendio.', badge: { label: 'Ayer', intent: 'neutral' } },
            { titulo: 'Cadetes', cuerpo: 'Florencia: Próxima reunión sábado.', badge: { label: 'Hace 2 días', intent: 'neutral' } },
          ],
        },
      ]}
    />
  );
}
