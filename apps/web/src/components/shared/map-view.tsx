'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { cn } from '@faro/ui';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  /** Tailwind bg-* class for the dot. */
  color: string;
  /** Optional text/emoji inside the dot. */
  label?: string;
  /** HTML rendered in the popup on click. */
  popup?: string;
}

interface Props {
  center: { lat: number; lng: number };
  zoom?: number;
  pins?: MapPin[];
  className?: string;
  attribution?: boolean;
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    basemap: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap · © CARTO',
    },
  },
  layers: [{ id: 'basemap', type: 'raster', source: 'basemap', minzoom: 0, maxzoom: 19 }],
};

/**
 * MapLibre con tiles públicos de OpenStreetMap (sin token).
 * Pins markdown libre — color/label desde Tailwind/HTML.
 */
export function MapView({ center, zoom = 12, pins = [], className, attribution = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!ref.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: attribution ? {} : false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    mapRef.current = map;

    // Force resize once mounted (canvas often initializes with 0×0 in flex layouts)
    const t = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 500);

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(ref.current);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      ro.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter([center.lng, center.lat]);
    map.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const p of pins) {
      const el = document.createElement('div');
      el.className = `relative flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shadow-lg ring-2 ring-white cursor-pointer transition-transform hover:scale-110 ${p.color}`;
      if (p.label) el.textContent = p.label;

      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]);

      if (p.popup) {
        const popup = new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(p.popup);
        marker.setPopup(popup);
      }

      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [pins]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100',
        className,
      )}
    />
  );
}
