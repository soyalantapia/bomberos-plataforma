import { Cable, FileLock2, ServerCog, Webhook } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function IntegracionesFed() {
  return (
    <SimplePage
      objetivo="Federación · Integraciones"
      title="Conexiones con sistemas externos"
      description="Identidad, salud ocupacional y coordinación operativa. Diseñado para no duplicar carga y mantener trazabilidad."
      icono={<Cable size={26} />}
      intro={{
        titulo: '🚧 Próxima fase (Q2 2026)',
        cuerpo:
          'Estas integraciones requieren convenio con cada organismo. Listamos lo que se evalúa, los logs y el portal para terceros que consumirán datos vía API.',
      }}
      kpis={[
        { label: 'En análisis', value: 3, hint: 'convenios', intent: 'warn' },
        { label: 'Activas', value: 0, hint: 'esperando alta', icon: <ServerCog size={16} /> },
        { label: 'Webhooks', value: 0, hint: 'configurados', icon: <Webhook size={16} /> },
        {
          label: 'Cifrado',
          value: 'mTLS',
          hint: 'cliente + servidor',
          icon: <FileLock2 size={16} />,
        },
      ]}
      tabs={[
        {
          value: 'conn',
          label: 'Conexiones',
          items: [
            {
              titulo: 'RENAPER',
              cuerpo:
                'Verificación de identidad por DNI al alta de personal · evita carga manual de datos',
              badge: { label: 'En análisis', intent: 'warn' },
              icon: <ServerCog size={16} />,
            },
            {
              titulo: 'ART (Aseguradora de Riesgos del Trabajo)',
              cuerpo: 'Cobertura del personal operativo · alta automática al ingresar al cuartel',
              badge: { label: 'En análisis', intent: 'warn' },
              icon: <ServerCog size={16} />,
            },
            {
              titulo: 'Defensa Civil municipal',
              cuerpo: 'Coordinación operativa en eventos masivos · estado de móviles en vivo',
              badge: { label: 'En análisis', intent: 'warn' },
              icon: <ServerCog size={16} />,
            },
          ],
        },
        {
          value: 'logs',
          label: 'Logs',
          items: [
            {
              titulo: 'Sin actividad',
              cuerpo:
                'Aún no hay integraciones activas. Cuando se conecte una, las llamadas API aparecen acá con su latencia y código de respuesta.',
              icon: <Webhook size={16} />,
            },
          ],
        },
      ]}
    />
  );
}
