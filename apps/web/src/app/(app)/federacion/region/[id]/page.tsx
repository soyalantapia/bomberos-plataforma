import { cuartelesMock } from '../../../../../data/cuarteles';

import View from './view';

export function generateStaticParams() {
  return [...new Set(cuartelesMock.map((c) => c.region))].map((id) => ({ id }));
}

export default function RegionPage() {
  return <View />;
}
