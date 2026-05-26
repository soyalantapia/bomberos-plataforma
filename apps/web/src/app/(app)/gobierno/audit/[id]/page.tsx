import View from './view';

// IDs derivados del seedAudit del listado (apps/web/src/app/(app)/gobierno/audit/page.tsx).
// Se hardcodean aquí porque ese listado es un client component que no puede ser
// importado desde un server component sin arrastrar 'use client'.
const AUDIT_IDS = [
  'aud-1',
  'aud-2',
  'aud-3',
  'aud-4',
  'aud-5',
  'aud-6',
  'aud-7',
  'aud-8',
  'aud-9',
  'aud-10',
  'aud-11',
  'aud-12',
  'aud-13',
  'aud-14',
  'aud-15',
  'aud-16',
  'aud-17',
  'aud-18',
  'aud-19',
  'aud-20',
  'aud-21',
];

export function generateStaticParams() {
  return AUDIT_IDS.map((id) => ({ id }));
}

export default function FichaAuditPage() {
  return <View />;
}
