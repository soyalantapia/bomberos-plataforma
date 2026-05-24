import { MessageSquare, Megaphone, Users2 } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function ComunicacionPage() {
  return (
    <SimplePage
      objetivo="Comunicación interna"
      title="Avisos del cuartel y chat por sección"
      description="Lo importante del cuartel y conversaciones por grupo. Reemplaza al WhatsApp informal."
      icono={<MessageSquare size={26} />}
      kpis={[
        {
          label: 'Avisos hoy',
          value: 3,
          hint: 'sin leer',
          intent: 'warn',
          icon: <Megaphone size={16} />,
        },
        { label: 'Chats activos', value: 3, hint: 'grupos' },
        { label: 'Tu sección', value: 'Operativa', hint: '14 personas', intent: 'brand' },
      ]}
      tabs={[
        {
          value: 'avisos',
          label: 'Avisos',
          items: [
            {
              titulo: '📋 Curso de rescate vehicular',
              cuerpo: 'Inscripción abierta hasta el 30/5.',
              badge: { label: 'Hoy', intent: 'brand' },
            },
            {
              titulo: '🔧 Mantenimiento Móvil BV-5',
              cuerpo: 'Mañana de 8 a 12 hs.',
              badge: { label: 'Mañana', intent: 'warn' },
            },
            {
              titulo: '🩸 Donación de sangre',
              cuerpo: 'Sábado 25/5 · Hospital Municipal.',
              badge: { label: 'Sábado', intent: 'neutral' },
            },
          ],
        },
        {
          value: 'chat',
          label: 'Chat',
          items: [
            {
              titulo: 'Cuartel general',
              cuerpo: 'Mariana: Mañana 7am en Pueyrredón.',
              badge: { label: 'Hoy 14:32', intent: 'brand' },
              icon: <Users2 size={16} />,
            },
            {
              titulo: 'Sección Operativa',
              cuerpo: 'Roberto: Bien hecho con lo del incendio.',
              badge: { label: 'Ayer', intent: 'neutral' },
              icon: <Users2 size={16} />,
            },
            {
              titulo: 'Cadetes',
              cuerpo: 'Florencia: Próxima reunión sábado.',
              badge: { label: 'Hace 2 días', intent: 'neutral' },
              icon: <Users2 size={16} />,
            },
          ],
        },
      ]}
    />
  );
}
