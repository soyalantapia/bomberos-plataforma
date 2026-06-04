import { cuartelesMock } from '../../../../../data/cuarteles';

import View from './view';

export function generateStaticParams() {
  return cuartelesMock.map((c) => ({ id: c.id }));
}

export default function FichaCuartelPage() {
  return <View />;
}
