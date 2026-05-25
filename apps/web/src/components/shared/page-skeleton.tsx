'use client';

import { Card, CardContent, Skeleton, cn } from '@faro/ui';

interface Props {
  /** Variante de layout */
  variant?: 'list' | 'cards' | 'table' | 'detail' | 'dashboard';
  /** Mostrar PageHero placeholder */
  hero?: boolean;
  className?: string;
}

/**
 * Skeleton reutilizable para páginas que cargan data. Para uso mientras se hidrata
 * Zustand persist o al cambiar de cuartel.
 *
 * @example
 * const [loading, setLoading] = useState(true);
 * if (loading) return <PageSkeleton variant="list" />;
 */
export function PageSkeleton({ variant = 'list', hero = true, className }: Props) {
  return (
    <div className={cn('mx-auto max-w-6xl space-y-5', className)}>
      {hero && (
        <div className="from-brand-50 rounded-2xl border border-slate-200 bg-gradient-to-br to-white p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-2 h-6 w-8" />
                <Skeleton className="mt-1 h-2.5 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'list' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {variant === 'cards' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variant === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="border-b border-slate-100 p-4">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[40px_1fr_1fr_auto] items-center gap-3 p-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {variant === 'detail' && (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-6 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {variant === 'dashboard' && (
        <>
          <div className="grid gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="space-y-2 p-5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="space-y-2 p-5">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
