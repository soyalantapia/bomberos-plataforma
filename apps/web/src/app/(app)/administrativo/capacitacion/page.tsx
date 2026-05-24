import { SimplePage } from '../../../../components/feedback/simple-page';

export default function CapacitacionGestion() {
  return (
    <SimplePage
      title="Capacitación (gestión)"
      description="Cursos, centros de práctica y acreditaciones"
      tabs={[
        {
          value: 'cursos',
          label: 'Cursos',
          items: [
            { titulo: 'Rescate vehicular avanzado', cuerpo: '12 inscriptos · Federación', badge: { label: 'Abierto', intent: 'ok' } },
            { titulo: 'Manejo víctimas múltiples', cuerpo: '14 inscriptos · CEPROS Norte', badge: { label: 'Abierto', intent: 'ok' } },
            { titulo: 'Incendios estructurales II', cuerpo: '5 inscriptos · CEPROS Norte', badge: { label: 'Abierto', intent: 'ok' } },
          ],
        },
        { value: 'cepros', label: 'CEPROS', items: [
          { titulo: 'CEPROS Norte GBA', cuerpo: 'San Martín · capacidad 32' },
          { titulo: 'CEPROS Tigre', cuerpo: 'Tigre · capacidad 24' },
        ]},
        { value: 'deptos', label: 'Departamentos', items: [
          { titulo: 'Departamento de Capacitación', cuerpo: '3 instructores activos' },
        ]},
        { value: 'cats', label: 'Categorías', items: [
          { titulo: 'Operativos · rescate', cuerpo: '4 cursos vigentes' },
          { titulo: 'Operativos · incendio', cuerpo: '3 cursos vigentes' },
          { titulo: 'Administrativos', cuerpo: '2 cursos vigentes' },
        ]},
        { value: 'acred', label: 'Acreditaciones', items: [
          { titulo: 'Folio 2026/04 emitido', cuerpo: '8 certificados · Federación' },
          { titulo: 'Folio 2026/03 emitido', cuerpo: '12 certificados · Federación' },
        ]},
      ]}
    />
  );
}
