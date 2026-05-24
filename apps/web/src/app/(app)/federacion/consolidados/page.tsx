import { SimplePage } from '../../../../components/feedback/simple-page';

export default function ConsolidadosFed() {
  return (
    <SimplePage
      title="Personal y servicios consolidados"
      description="Agregados de todos los cuarteles de la región"
      tabs={[
        { value: 'personal', label: 'Personal', items: [
          { titulo: 'Total activos región', cuerpo: '236 personas' },
          { titulo: 'Cadetes', cuerpo: '28' },
          { titulo: 'Comandantes', cuerpo: '4' },
          { titulo: 'Mujeres en jerarquías de mando', cuerpo: '7 (38%)' },
        ]},
        { value: 'serv', label: 'Servicios', items: [
          { titulo: 'Total servicios región (mayo)', cuerpo: '42 servicios' },
          { titulo: 'Incendios estructurales', cuerpo: '14' },
          { titulo: 'Rescates', cuerpo: '11' },
          { titulo: 'Accidentes', cuerpo: '9' },
          { titulo: 'Forestales', cuerpo: '5' },
          { titulo: 'Otros', cuerpo: '3' },
        ]},
        { value: 'cap', label: 'Capacitación', items: [
          { titulo: 'Cursos en marcha región', cuerpo: '8 cursos · 124 inscriptos' },
          { titulo: 'Certificados emitidos mayo', cuerpo: '32 certificados' },
        ]},
      ]}
    />
  );
}
