import { SimplePage } from '../../../../components/feedback/simple-page';

export default function MaterialesPage() {
  return (
    <SimplePage
      title="Materiales / Ropería"
      description="Equipamiento, pañol e inventario por móvil"
      tabs={[
        {
          value: 'movil',
          label: 'Móvil / Equipamiento',
          items: [
            { titulo: 'BV-3 · Manguera 70 mm', cuerpo: '4 unidades en uso', badge: { label: 'OK', intent: 'ok' } },
            { titulo: 'BV-3 · Línea de ataque', cuerpo: 'Revisada 20/5/2026', badge: { label: 'OK', intent: 'ok' } },
            { titulo: 'BV-5 · Pinzas hidráulicas', cuerpo: 'Mantenimiento programado', badge: { label: 'Próximo', intent: 'warn' } },
            { titulo: 'BV-7 · Bidón forestal', cuerpo: '2 unidades, falta 1 reposición', badge: { label: 'Atención', intent: 'warn' } },
          ],
        },
        {
          value: 'panol',
          label: 'Pañol',
          items: [
            { titulo: 'EPP completo', cuerpo: '18 sets activos', badge: { label: 'OK', intent: 'ok' } },
            { titulo: 'Botellas SCBA', cuerpo: '12 cargadas', badge: { label: 'OK', intent: 'ok' } },
            { titulo: 'Linternas industriales', cuerpo: '8 operativas', badge: { label: 'OK', intent: 'ok' } },
          ],
        },
        {
          value: 'roperia',
          label: 'Ropería',
          items: [
            { titulo: 'Camisas reglamentarias', cuerpo: '36 stock', badge: { label: 'OK', intent: 'ok' } },
            { titulo: 'Pantalones operativos', cuerpo: '24 stock', badge: { label: 'OK', intent: 'ok' } },
            { titulo: 'Buzos de invierno', cuerpo: '6 stock — pedir más', badge: { label: 'Bajo', intent: 'warn' } },
          ],
        },
        {
          value: 'inv',
          label: 'Inventario general',
          items: [
            { titulo: 'Total ítems', cuerpo: '247 registrados', badge: { label: 'Actualizado', intent: 'ok' } },
          ],
        },
      ]}
    />
  );
}
