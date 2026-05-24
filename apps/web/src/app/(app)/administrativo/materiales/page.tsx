import { Package, Shirt, Wrench, Truck } from 'lucide-react';

import { SimplePage } from '../../../../components/feedback/simple-page';

export default function MaterialesPage() {
  return (
    <SimplePage
      objetivo="Administrativo · Materiales"
      title="Equipamiento, ropería e inventario"
      description="Lo que tiene cada móvil, el pañol, la ropa operativa y el inventario general. Carga masiva y control de estado."
      icono={<Package size={26} />}
      kpis={[
        { label: 'Ítems totales', value: 247, hint: 'inventariados', intent: 'brand' },
        {
          label: 'Por revisar',
          value: 3,
          hint: 'estado warn',
          intent: 'warn',
          icon: <Wrench size={16} />,
        },
        { label: 'Bajo stock', value: 1, hint: 'buzos invierno', intent: 'warn' },
        { label: 'OK', value: 243, hint: 'operativos', intent: 'ok' },
      ]}
      searchable
      tabs={[
        {
          value: 'movil',
          label: 'Por móvil',
          items: [
            {
              titulo: 'BV-3 · Manguera 70 mm',
              cuerpo: '4 unidades en uso · revisado 18/5',
              badge: { label: 'OK', intent: 'ok' },
              icon: <Truck size={16} />,
            },
            {
              titulo: 'BV-3 · Línea de ataque',
              cuerpo: 'Revisada 20/5/2026',
              badge: { label: 'OK', intent: 'ok' },
              icon: <Truck size={16} />,
            },
            {
              titulo: 'BV-5 · Pinzas hidráulicas',
              cuerpo: 'Mantenimiento programado para 28/5',
              badge: { label: 'Próximo', intent: 'warn' },
              icon: <Wrench size={16} />,
            },
            {
              titulo: 'BV-7 · Bidón forestal',
              cuerpo: '2 unidades · falta 1 reposición',
              badge: { label: 'Atención', intent: 'warn' },
              icon: <Package size={16} />,
            },
          ],
        },
        {
          value: 'panol',
          label: 'Pañol',
          items: [
            {
              titulo: 'EPP completo',
              cuerpo: '18 sets activos',
              badge: { label: 'OK', intent: 'ok' },
            },
            {
              titulo: 'Botellas SCBA',
              cuerpo: '12 cargadas · próxima inspección 15/6',
              badge: { label: 'OK', intent: 'ok' },
            },
            {
              titulo: 'Linternas industriales',
              cuerpo: '8 operativas · 2 con batería baja',
              badge: { label: 'Revisar', intent: 'warn' },
            },
          ],
        },
        {
          value: 'roperia',
          label: 'Ropería',
          items: [
            {
              titulo: 'Camisas reglamentarias',
              cuerpo: '36 stock',
              badge: { label: 'OK', intent: 'ok' },
              icon: <Shirt size={16} />,
            },
            {
              titulo: 'Pantalones operativos',
              cuerpo: '24 stock',
              badge: { label: 'OK', intent: 'ok' },
              icon: <Shirt size={16} />,
            },
            {
              titulo: 'Buzos de invierno',
              cuerpo: '6 stock — pedir reposición',
              badge: { label: 'Bajo stock', intent: 'warn' },
              icon: <Shirt size={16} />,
            },
          ],
        },
        {
          value: 'inv',
          label: 'General',
          items: [
            {
              titulo: 'Inventario total',
              cuerpo: '247 ítems registrados · última auditoría 15/5',
              badge: { label: 'Actualizado', intent: 'ok' },
            },
          ],
        },
      ]}
    />
  );
}
