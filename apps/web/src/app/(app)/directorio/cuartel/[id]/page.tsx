import { cuartelesMock } from '../../../../../data/cuarteles';

import { CuartelDetalladoView } from './cuartel-view';

export function generateStaticParams() {
  return cuartelesMock.map((c) => ({ id: c.id.replace(/^cuartel-/, '') }));
}

export default async function CuartelDetalladoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CuartelDetalladoView slug={id} />;
}
