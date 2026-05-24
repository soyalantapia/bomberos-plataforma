import { FileText, FolderOpen, Upload } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function DocumentosPage() {
  return (
    <SimplePage
      objetivo="Administrativo · Documentos"
      title="Biblioteca con búsqueda semántica IA"
      description="Subís y la IA indexa para que después puedas buscar por intención, no por nombre exacto."
      icono={<FolderOpen size={26} />}
      intro={{
        titulo: '🔎 Búsqueda semántica (IA)',
        cuerpo:
          'Buscás "qué dice el reglamento sobre uniforme" y la IA te lleva al párrafo, aunque tu búsqueda no use las palabras del documento.',
      }}
      kpis={[
        { label: 'Documentos', value: 50, hint: 'totales' },
        { label: 'Vigentes', value: 36, intent: 'ok' },
        { label: 'Categorías', value: 4, intent: 'brand' },
        { label: 'Tamaño biblioteca', value: '142 MB', hint: 'cifrada' },
      ]}
      searchable
      tabs={[
        {
          value: 'biblio',
          label: 'Biblioteca',
          items: [
            {
              titulo: 'Reglamento interno · v2024',
              cuerpo: 'PDF · 142 páginas · vigente desde 1/3/2024',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <FileText size={16} />,
            },
            {
              titulo: 'Manual del Fondo Nacional',
              cuerpo: 'PDF · 56 páginas · Federación',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <FileText size={16} />,
            },
            {
              titulo: 'Protocolo COVID actualizado',
              cuerpo: 'PDF · marzo 2026',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <FileText size={16} />,
            },
            {
              titulo: 'Protocolo de carga de servicio',
              cuerpo: 'PDF · 24 páginas · Mando',
              badge: { label: 'Vigente', intent: 'ok' },
              icon: <FileText size={16} />,
            },
            {
              titulo: 'Actas 2025',
              cuerpo: 'Carpeta · 12 archivos · 38 MB',
              badge: { label: 'Archivo', intent: 'neutral' },
              icon: <FolderOpen size={16} />,
            },
          ],
        },
        {
          value: 'cat',
          label: 'Por categoría',
          items: [
            {
              titulo: 'Normativa',
              cuerpo: '8 documentos · reglamentos y protocolos',
              badge: { label: '8', intent: 'brand' },
              icon: <FolderOpen size={16} />,
            },
            {
              titulo: 'Manuales',
              cuerpo: '12 documentos · operativos y administrativos',
              badge: { label: '12', intent: 'brand' },
              icon: <FolderOpen size={16} />,
            },
            {
              titulo: 'Actas',
              cuerpo: '24 documentos · reuniones y resoluciones',
              badge: { label: '24', intent: 'brand' },
              icon: <FolderOpen size={16} />,
            },
            {
              titulo: 'Plantillas',
              cuerpo: '6 documentos · modelos rellenables',
              badge: { label: '6', intent: 'brand' },
              icon: <FolderOpen size={16} />,
            },
          ],
        },
        {
          value: 'subir',
          label: 'Subir',
          items: [
            {
              titulo: '⬆️ Arrastrá archivos acá',
              cuerpo:
                'PDF, imágenes, planillas — la IA los indexa para que aparezcan en la búsqueda semántica.',
              badge: { label: 'Drop zone', intent: 'brand' },
              icon: <Upload size={16} />,
            },
          ],
        },
      ]}
      acciones={null}
    />
  );
}
