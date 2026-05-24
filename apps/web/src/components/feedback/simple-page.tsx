'use client';

import { useState } from 'react';

import { Badge, Card, CardContent, SectionHeader, Tabs, TabsContent, TabsList, TabsTrigger } from '@faro/ui';

interface ListItem {
  titulo: string;
  cuerpo?: string;
  badge?: { label: string; intent?: 'ok' | 'warn' | 'risk' | 'neutral' | 'brand' | 'fire' };
}

export interface SimplePageProps {
  title: string;
  description: string;
  intro?: { titulo: string; cuerpo: string };
  tabs: { value: string; label: string; items: ListItem[] }[];
}

export function SimplePage({ title, description, intro, tabs }: SimplePageProps) {
  const [tab, setTab] = useState(tabs[0]?.value ?? '');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionHeader title={title} description={description} />

      {intro && (
        <Card className="bg-brand-50 border-brand-100">
          <CardContent className="p-4">
            <div className="font-semibold text-brand-900">{intro.titulo}</div>
            <p className="text-sm text-brand-900/80 mt-0.5">{intro.cuerpo}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card>
              <CardContent className="p-0">
                {t.items.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">Sin elementos.</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {t.items.map((it, i) => (
                      <li key={i} className="p-4 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900">{it.titulo}</div>
                          {it.cuerpo && <div className="text-sm text-slate-600 mt-0.5">{it.cuerpo}</div>}
                        </div>
                        {it.badge && <Badge intent={it.badge.intent ?? 'neutral'}>{it.badge.label}</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
