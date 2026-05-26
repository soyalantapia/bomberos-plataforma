import { personasMock } from '../../../../../data/personas';

import View from './view';

export function generateStaticParams() {
  return personasMock.map((p) => ({ id: p.id }));
}

export default function FichaPersonaPage() {
  return <View />;
}
