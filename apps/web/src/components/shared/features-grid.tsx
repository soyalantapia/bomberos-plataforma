'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { Badge, Card, CardContent, cn } from '@faro/ui';

export interface FeatureCard {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  color: string;
  nuevo?: boolean;
}

interface Props {
  cards: FeatureCard[];
  titulo?: string;
  descripcion?: string;
  columnas?: 2 | 3 | 4;
}

/**
 * Grilla de cards de acción rápida — útil en dashboards para
 * dirigir al usuario a features nuevas.
 */
export function FeaturesGrid({ cards, titulo, descripcion, columnas = 3 }: Props) {
  const colsClass =
    columnas === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : columnas === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2';
  return (
    <section>
      {titulo && (
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-xs text-slate-500">{descripcion}</p>}
        </div>
      )}
      <div className={cn('grid gap-3', colsClass)}>
        {cards.map((c, idx) => (
          <motion.div
            key={c.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Link href={c.href as never}>
              <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white',
                        c.color,
                      )}
                    >
                      {c.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.titulo}</span>
                        {c.nuevo && <Badge intent="risk">Nuevo</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600">{c.descripcion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
