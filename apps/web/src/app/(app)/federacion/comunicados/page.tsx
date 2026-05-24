import { SimplePage } from '../../../../components/feedback/simple-page';

export default function ComunicadosFed() {
  return (
    <SimplePage
      title="Documentos / Comunicados"
      description="Distribuí normativa y manuales a los cuarteles"
      tabs={[
        { value: 'norm', label: 'Normativa', items: [
          { titulo: 'Ley 25.054', cuerpo: 'Servicio de Bomberos Voluntarios' },
          { titulo: 'Resolución 24/26', cuerpo: 'Actualización de cómputo' },
          { titulo: 'Disposición 03/26', cuerpo: 'Calendario de rendiciones' },
        ]},
        { value: 'manu', label: 'Manuales del Fondo', items: [
          { titulo: 'Manual de uso · v2026', cuerpo: 'PDF · 56 páginas', badge: { label: 'Vigente', intent: 'ok' } },
          { titulo: 'FAQ rendiciones', cuerpo: 'PDF · 12 páginas' },
        ]},
        { value: 'com', label: 'Comunicar', items: [
          { titulo: 'Nuevo comunicado a 28 cuarteles', cuerpo: 'Asunto · cuerpo · adjuntos · canal (email/WhatsApp/push)' },
        ]},
      ]}
    />
  );
}
