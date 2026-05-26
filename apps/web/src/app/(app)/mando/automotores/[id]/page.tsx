import { movilesMock } from '../../../../../data/moviles';

import View from './view';

export function generateStaticParams() {
  return movilesMock.map((m) => ({ id: m.id }));
}

export default function FichaMovilPage() {
  return <View />;
}
