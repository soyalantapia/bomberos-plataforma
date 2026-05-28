import { cn } from '../lib/cn';

/** Antepone NEXT_PUBLIC_BASE_PATH a paths absolutos /foo si está seteado. */
function resolveSrc(src: string): string {
  if (/^([a-z]+:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!base) return src;
  const normalized = src.startsWith('/') ? src : `/${src}`;
  // Evitar doble basePath si ya viene incluido
  if (normalized.startsWith(base + '/') || normalized === base) return normalized;
  return `${base}${normalized}`;
}

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  const hue = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;
  const bg = `hsl(${hue}, 35%, 85%)`;
  const fg = `hsl(${hue}, 45%, 28%)`;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveSrc(src)}
        alt={name}
        width={size}
        height={size}
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold',
        className,
      )}
      style={{ width: size, height: size, backgroundColor: bg, color: fg, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}
