import View from './view';

// IDs derivados del HIDRANTES_MOCK del listado
// (apps/web/src/app/(app)/mando/hidrantes/page.tsx). Se hardcodean porque ese
// listado es un client component que no puede importarse desde un server component.
const HIDRANTE_IDS = ['h-001', 'h-002', 'h-003', 'h-004', 'h-005', 'h-006', 'h-007', 'h-008'];

export function generateStaticParams() {
  return HIDRANTE_IDS.map((id) => ({ id }));
}

export default function FichaHidrantePage() {
  return <View />;
}
