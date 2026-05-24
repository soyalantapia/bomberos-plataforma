import { SimplePage } from '../../../../components/feedback/simple-page';

export default function IntegracionesFed() {
  return (
    <SimplePage
      title="API / Integraciones"
      description="Conexiones con sistemas externos · futuro"
      intro={{
        titulo: '🚧 Próxima fase',
        cuerpo: 'Integraciones con RENAPER, ART y Defensa Civil. Pensado para el segundo trimestre.',
      }}
      tabs={[
        { value: 'conn', label: 'Conexiones', items: [
          { titulo: 'RENAPER', cuerpo: 'Verificación de identidad por DNI', badge: { label: 'En análisis', intent: 'neutral' } },
          { titulo: 'ART', cuerpo: 'Cobertura de personal operativo', badge: { label: 'En análisis', intent: 'neutral' } },
          { titulo: 'Defensa Civil', cuerpo: 'Coordinación operativa', badge: { label: 'En análisis', intent: 'neutral' } },
        ]},
        { value: 'logs', label: 'Logs', items: [
          { titulo: 'Sin actividad', cuerpo: 'Aún no hay integraciones activas.' },
        ]},
      ]}
    />
  );
}
