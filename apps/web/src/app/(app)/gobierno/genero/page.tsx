import { SimplePage } from '../../../../components/feedback/simple-page';

export default function GeneroPage() {
  return (
    <SimplePage
      title="Género"
      description="Canal de denuncias con confidencialidad reforzada"
      intro={{
        titulo: '🔒 Canal confidencial',
        cuerpo: 'Las denuncias por género tienen acceso aún más restringido. Solo la referente de género y la Federación las ven.',
      }}
      tabs={[
        { value: 'denuncias', label: 'Denuncias', items: [
          { titulo: 'Canal abierto', cuerpo: 'Sin denuncias activas este mes', badge: { label: 'Sin novedades', intent: 'ok' } },
        ]},
        { value: 'docs', label: 'Documentos', items: [
          { titulo: 'Protocolo de actuación', cuerpo: 'PDF · vigente' },
          { titulo: 'Guía de prevención', cuerpo: 'PDF · vigente' },
          { titulo: 'Formulario de denuncia', cuerpo: 'PDF rellenable · descargable' },
        ]},
        { value: 'recursos', label: 'Recursos', items: [
          { titulo: 'Línea 144 (Ministerio)', cuerpo: 'Atención 24/7' },
          { titulo: 'Servicio de orientación', cuerpo: 'Cuartel · Florencia Salinas' },
        ]},
      ]}
    />
  );
}
