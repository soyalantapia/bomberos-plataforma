import { serviciosMock } from '../../../../../data/servicios';

import View from './view';

export function generateStaticParams() {
  return serviciosMock.map((s) => ({ id: s.id }));
}

export default function FichaServicioPage() {
  return <View />;
}
