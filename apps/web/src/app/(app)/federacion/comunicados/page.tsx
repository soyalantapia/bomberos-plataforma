import { BookOpen, FileText, Megaphone, Send } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function ComunicadosFed() {
  return (
    <SimplePage
      objetivo="Federación · Comunicados"
      title="Distribución de normativa, manuales y comunicaciones"
      description="Llegás a los 4 cuarteles con un solo envío. Confirmás recepción y lectura."
      icono={<Megaphone size={26} />}
      kpis={[
        {
          label: 'Normativa vigente',
          value: 3,
          hint: 'leyes y resoluciones',
          icon: <BookOpen size={16} />,
        },
        { label: 'Manuales', value: 6, hint: 'descargables', icon: <FileText size={16} /> },
        {
          label: 'Comunicados mes',
          value: 4,
          hint: 'enviados',
          intent: 'brand',
          icon: <Send size={16} />,
        },
        { label: 'Tasa lectura', value: '92%', hint: 'promedio', intent: 'ok' },
      ]}
      tabs={[
        {
          value: 'norm',
          label: 'Normativa',
          items: [
            {
              titulo: 'Ley 25.054',
              cuerpo: 'Servicio Nacional de Bomberos Voluntarios · base legal del Fondo',
              badge: { label: 'Ley nacional', intent: 'brand' },
              icon: <BookOpen size={16} />,
            },
            {
              titulo: 'Resolución 24/26 · Fondo Nacional',
              cuerpo: 'Actualización del cómputo · vigente desde 1/4/2026',
              badge: { label: 'Nueva', intent: 'warn' },
              icon: <BookOpen size={16} />,
            },
            {
              titulo: 'Disposición 03/26',
              cuerpo: 'Calendario de rendiciones · plazos 2026',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <BookOpen size={16} />,
            },
          ],
        },
        {
          value: 'manu',
          label: 'Manuales',
          items: [
            {
              titulo: 'Manual de uso del Fondo · v2026',
              cuerpo: 'PDF · 56 páginas · cómo armar la rendición paso a paso',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <FileText size={16} />,
            },
            {
              titulo: 'FAQ rendiciones',
              cuerpo: 'PDF · 12 páginas · respuestas a las dudas más frecuentes',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <FileText size={16} />,
            },
          ],
        },
        {
          value: 'com',
          label: 'Enviar',
          items: [
            {
              titulo: 'Nuevo comunicado a 4 cuarteles',
              cuerpo: 'Asunto + cuerpo + adjuntos · canal: email / WhatsApp / push de la app',
              badge: { label: 'Componer', intent: 'brand' },
              icon: <Send size={16} />,
            },
            {
              titulo: '✉ Plantillas disponibles',
              cuerpo: 'Recordatorio rendición · Convocatoria reunión · Alerta vencimientos',
            },
          ],
        },
      ]}
    />
  );
}
