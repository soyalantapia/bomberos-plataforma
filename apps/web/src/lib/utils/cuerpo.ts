import type { Persona } from '@faro/types';

export type Cuerpo = 'operativo' | 'administrativo' | 'cadete' | 'gobierno' | 'mando';

const ADMINISTRATIVO_KEYWORDS = ['padrón', 'padron', 'secretar', 'administra'];

export function clasificarCuerpo(p: Persona): Cuerpo {
  if (p.jerarquia === 'cadete') return 'cadete';
  if (p.jerarquia === 'comandante' || p.jerarquia === 'sub_comandante' || p.jerarquia === 'jefe') {
    return 'mando';
  }
  if (p.perfiles.includes('gobierno') && !p.perfiles.includes('mando')) {
    return 'gobierno';
  }
  const fnLower = p.funcion.toLowerCase();
  if (
    p.perfiles.includes('administrativo') &&
    ADMINISTRATIVO_KEYWORDS.some((k) => fnLower.includes(k))
  ) {
    return 'administrativo';
  }
  return 'operativo';
}

export const cuerpoLabel: Record<Cuerpo, string> = {
  operativo: 'Cuerpo activo',
  mando: 'Mando',
  administrativo: 'Cuerpo administrativo',
  cadete: 'Cadetes',
  gobierno: 'Gobierno interno',
};

export const cuerpoIntent: Record<Cuerpo, 'brand' | 'ok' | 'warn' | 'neutral'> = {
  operativo: 'brand',
  mando: 'warn',
  administrativo: 'neutral',
  cadete: 'ok',
  gobierno: 'neutral',
};

export function contarPorCuerpo(personas: Persona[]): Record<Cuerpo, number> {
  return personas.reduce(
    (acc, p) => {
      const c = clasificarCuerpo(p);
      acc[c] += 1;
      return acc;
    },
    { operativo: 0, mando: 0, administrativo: 0, cadete: 0, gobierno: 0 } as Record<Cuerpo, number>,
  );
}

function diasHasta(iso: string): number {
  const target = new Date(iso).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.round((target - now) / 8.64e7);
}

export type AlertaPersona = {
  tipo: 'aptitud' | 'curso' | 'licencia_conducir' | 'estado';
  severidad: 'warn' | 'risk';
  texto: string;
};

export function detectarAlertasPersona(p: Persona): AlertaPersona[] {
  const alertas: AlertaPersona[] = [];
  if (p.estado === 'licencia') {
    alertas.push({ tipo: 'estado', severidad: 'warn', texto: 'En licencia' });
  }
  if (p.estado === 'baja' || p.estado === 'jubilado') {
    alertas.push({ tipo: 'estado', severidad: 'risk', texto: 'Inactivo' });
  }
  if (p.salud.aptitudVencimiento) {
    const d = diasHasta(p.salud.aptitudVencimiento);
    if (d < 0)
      alertas.push({ tipo: 'aptitud', severidad: 'risk', texto: `Aptitud vencida hace ${-d}d` });
    else if (d <= 30)
      alertas.push({ tipo: 'aptitud', severidad: 'warn', texto: `Aptitud vence en ${d}d` });
  }
  for (const c of p.cursos) {
    if (c.vigente === false) {
      alertas.push({ tipo: 'curso', severidad: 'risk', texto: `Curso vencido: ${c.nombre}` });
    } else if (c.vencimiento) {
      const d = diasHasta(c.vencimiento);
      if (d < 0)
        alertas.push({ tipo: 'curso', severidad: 'risk', texto: `Curso vencido: ${c.nombre}` });
      else if (d <= 30)
        alertas.push({ tipo: 'curso', severidad: 'warn', texto: `${c.nombre} vence en ${d}d` });
    }
  }
  if (p.licenciaConducirVencimiento) {
    const d = diasHasta(p.licenciaConducirVencimiento);
    if (d < 0)
      alertas.push({
        tipo: 'licencia_conducir',
        severidad: 'risk',
        texto: 'Lic. conducir vencida',
      });
    else if (d <= 30)
      alertas.push({
        tipo: 'licencia_conducir',
        severidad: 'warn',
        texto: `Lic. conducir vence en ${d}d`,
      });
  }
  return alertas;
}

export function disponibleAhora(p: Persona): boolean {
  if (p.estado !== 'activo') return false;
  const alertasCriticas = detectarAlertasPersona(p).filter((a) => a.severidad === 'risk');
  return alertasCriticas.length === 0;
}
