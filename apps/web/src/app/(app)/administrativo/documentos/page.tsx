import { SimplePage } from '../../../../components/feedback/simple-page';

export default function DocumentosPage() {
  return (
    <SimplePage
      title="Documentos"
      description="Biblioteca del cuartel con búsqueda semántica"
      intro={{
        titulo: '🔎 Búsqueda semántica (IA)',
        cuerpo: 'Buscá por intención, no por palabra exacta. La IA entiende qué buscás aunque no recuerdes el nombre.',
      }}
      tabs={[
        {
          value: 'biblio',
          label: 'Biblioteca',
          items: [
            { titulo: 'Reglamento interno · v2024', cuerpo: 'PDF · 142 páginas', badge: { label: 'Vigente', intent: 'ok' } },
            { titulo: 'Manual del Fondo Nacional', cuerpo: 'PDF · 56 páginas', badge: { label: 'Vigente', intent: 'ok' } },
            { titulo: 'Protocolo COVID actualizado', cuerpo: 'PDF · marzo 2026', badge: { label: 'Vigente', intent: 'ok' } },
            { titulo: 'Actas 2025', cuerpo: 'Carpeta · 12 archivos', badge: { label: 'Archivo', intent: 'neutral' } },
          ],
        },
        {
          value: 'cat',
          label: 'Por categoría',
          items: [
            { titulo: 'Normativa (8)', cuerpo: 'Reglamentos y protocolos' },
            { titulo: 'Manuales (12)', cuerpo: 'Operativos y administrativos' },
            { titulo: 'Actas (24)', cuerpo: 'Reuniones y resoluciones' },
            { titulo: 'Plantillas (6)', cuerpo: 'Documentos modelo' },
          ],
        },
        {
          value: 'subir',
          label: 'Subir',
          items: [
            { titulo: 'Arrastrá archivos acá', cuerpo: 'PDF, imágenes, planillas — todo se indexa para búsqueda semántica.' },
          ],
        },
      ]}
    />
  );
}
