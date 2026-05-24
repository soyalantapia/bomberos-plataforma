import type { Asistencia, ComputoPersona } from '@faro/types';

export function calcularComputoMensual(asistencias: Asistencia[], cuartelId: string, mes: string): ComputoPersona[] {
  const porPersona = new Map<string, ComputoPersona>();
  for (const a of asistencias) {
    if (a.cuartelId !== cuartelId) continue;
    if (!a.fecha.startsWith(mes)) continue;
    let cur = porPersona.get(a.personaId);
    if (!cur) {
      cur = { personaId: a.personaId, cuartelId, mes, accidental: 0, obligatorio: 0, guardia: 0, jefatura: 0, ordenInterno: 0, licencia: 0, sancion: 0, total: 0 };
      porPersona.set(a.personaId, cur);
    }
    switch (a.tipo) {
      case 'accidental': cur.accidental += a.horas; break;
      case 'obligatorio': cur.obligatorio += a.horas; break;
      case 'guardia': cur.guardia += a.horas; break;
      case 'jefatura': cur.jefatura += a.horas; break;
      case 'orden_interno': cur.ordenInterno += a.horas; break;
      case 'licencia': cur.licencia += a.horas; break;
      case 'sancion': cur.sancion += a.horas; break;
    }
    cur.total = cur.accidental + cur.obligatorio + cur.guardia + cur.jefatura + cur.ordenInterno;
  }
  return [...porPersona.values()];
}
