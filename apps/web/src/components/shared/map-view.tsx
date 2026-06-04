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
  /** Apply a pulsing animation (for live/moving markers). */
  pulse?: boolean;
}

export interface MapCircle {
  lat: number;
  lng: number;
  radiusMeters: number;
  fillColor?: string;
  strokeColor?: string;
  opacity?: number;
}

export interface MapPolyline {
  points: Array<{ lat: number; lng: number }>;
  color?: string;
  width?: number;
  dashed?: boolean;
}

interface Props {
  center: { lat: number; lng: number };
  zoom?: number;
  pins?: MapPin[];
  circle?: MapCircle | null;
  polyline?: MapPolyline | null;
  className?: string;
  attribution?: boolean;
  /** Si es true, encuadra el mapa para que entren todos los pins (ignora center/zoom). */
  fitToPins?: boolean;
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

/** Genera un polígono circular alrededor de un punto (lat/lng) con radio en metros. */
function circlePolygon(
  center: { lat: number; lng: number },
  radiusMeters: number,
  points = 64,
): Array<[number, number]> {
  const km = radiusMeters / 1000;
  const earthRadius = 6371; // km
  const ret: Array<[number, number]> = [];
  const lat = (center.lat * Math.PI) / 180;
  const lng = (center.lng * Math.PI) / 180;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const lat2 = Math.asin(
      Math.sin(lat) * Math.cos(km / earthRadius) +
        Math.cos(lat) * Math.sin(km / earthRadius) * Math.cos(theta),
    );
    const lng2 =
      lng +
      Math.atan2(
        Math.sin(theta) * Math.sin(km / earthRadius) * Math.cos(lat),
        Math.cos(km / earthRadius) - Math.sin(lat) * Math.sin(lat2),
      );
    ret.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }
  ret.push(ret[0]!); // cerrar polígono
  return ret;
}

/**
 * MapLibre con tiles públicos de OpenStreetMap (sin token).
 * Pins markdown libre — color/label desde Tailwind/HTML.
 * Soporta también geocercas (círculo en metros) y polilíneas (rutas).
 */
export function MapView({
  center,
  zoom = 12,
  pins = [],
  circle = null,
  polyline = null,
  className,
  attribution = true,
  fitToPins = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const loadedRef = useRef(false);

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

    map.on('load', () => {
      loadedRef.current = true;
    });

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
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || fitToPins) return;
    map.setCenter([center.lng, center.lat]);
    map.setZoom(zoom);
  }, [center.lat, center.lng, zoom, fitToPins]);

  // Encuadre automático a todos los pins (vista provincial completa). Solo
  // reencuadra cuando cambian los límites reales, para no pisar el pan del usuario.
  const lastFitRef = useRef('');
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitToPins || pins.length === 0) return;
    const lats = pins.map((p) => p.lat);
    const lngs = pins.map((p) => p.lng);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
    const sig = bounds.flat().join(',');
    if (sig === lastFitRef.current) return;
    lastFitRef.current = sig;
    const apply = () => map.fitBounds(bounds, { padding: 36, animate: false, maxZoom: 11 });
    if (loadedRef.current) apply();
    else map.once('load', apply);
  }, [fitToPins, pins]);

  // Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const p of pins) {
      const el = document.createElement('div');
      el.className = `relative flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shadow-lg ring-2 ring-white cursor-pointer transition-transform hover:scale-110 ${p.color}`;
      if (p.label) el.textContent = p.label;
      if (p.pulse) {
        const ring = document.createElement('div');
        ring.className = `absolute inset-0 rounded-full ${p.color} opacity-60 animate-ping`;
        el.appendChild(ring);
      }

      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]);

      if (p.popup) {
        const popup = new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(p.popup);
        marker.setPopup(popup);
      }

      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [pins]);

  // Geocerca (círculo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyCircle = () => {
      const SOURCE_ID = 'faro-circle';
      const FILL_ID = 'faro-circle-fill';
      const LINE_ID = 'faro-circle-stroke';

      // Remove existing
      if (map.getLayer(FILL_ID)) map.removeLayer(FILL_ID);
      if (map.getLayer(LINE_ID)) map.removeLayer(LINE_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

      if (!circle) return;

      const ring = circlePolygon({ lat: circle.lat, lng: circle.lng }, circle.radiusMeters);
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [ring] },
        },
      });
      map.addLayer({
        id: FILL_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': circle.fillColor ?? '#10b981',
          'fill-opacity': circle.opacity ?? 0.15,
        },
      });
      map.addLayer({
        id: LINE_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': circle.strokeColor ?? circle.fillColor ?? '#10b981',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
    };

    if (loadedRef.current) applyCircle();
    else map.once('load', applyCircle);
  }, [circle]);

  // Polilínea (ruta)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyLine = () => {
      const SOURCE_ID = 'faro-line';
      const LINE_ID = 'faro-line-stroke';

      if (map.getLayer(LINE_ID)) map.removeLayer(LINE_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

      if (!polyline || polyline.points.length < 2) return;

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: polyline.points.map((p) => [p.lng, p.lat]),
          },
        },
      });
      map.addLayer({
        id: LINE_ID,
        type: 'line',
        source: SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': polyline.color ?? '#dc2626',
          'line-width': polyline.width ?? 4,
          'line-opacity': 0.8,
          ...(polyline.dashed ? { 'line-dasharray': [2, 2] as const } : {}),
        },
      });
    };

    if (loadedRef.current) applyLine();
    else map.once('load', applyLine);
  }, [polyline]);

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
