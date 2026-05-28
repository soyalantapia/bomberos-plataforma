/**
 * Antepone el basePath de Next.js a URLs de assets estáticos (servidos desde /public).
 *
 * En dev (basePath vacío) devuelve el path tal cual.
 * En export con basePath='/bomberos-plataforma' devuelve '/bomberos-plataforma/legajos/foo.jpg'.
 *
 * Usar SOLO para URLs de assets estáticos en el bundle (img src, etc).
 * Para rutas internas usar Link de Next que ya maneja basePath solo.
 */
export function withBasePath(path?: string | null): string | undefined {
  if (!path) return undefined;
  // Si ya es absoluta (http(s)://, data:, blob:) devolver intacta
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  // Asegurar slash inicial en path
  const normalized = path.startsWith('/') ? path : `/${path}`;
  // Si base está vacío, devolver normalized; si no, prepender
  return base ? `${base}${normalized}` : normalized;
}
