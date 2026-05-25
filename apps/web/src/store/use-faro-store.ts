'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
  Alerta,
  Asistencia,
  AuditEvent,
  Cuartel,
  Movil,
  Notificacion,
  Perfil,
  Persona,
  Rendicion,
  Servicio,
  SesionUsuario,
} from '@faro/types';

import {
  alertasMock,
  asistenciasMock,
  cuartelesMock,
  movilesMock,
  notificacionesMock,
  personasMock,
  rendicionMayoMock,
  serviciosMock,
} from '../data';
import { calcularComputoMensual } from '../lib/utils/computo';

interface State {
  hidratado: boolean;
  sesion: SesionUsuario | null;
  cuarteles: Cuartel[];
  personas: Persona[];
  moviles: Movil[];
  servicios: Servicio[];
  asistencias: Asistencia[];
  alertas: Alerta[];
  rendiciones: Record<string, Rendicion>;
  audit: AuditEvent[];
  notificaciones: Notificacion[];
}

interface Actions {
  iniciarSesion: (personaId: string, cuartelId: string, perfil: Perfil) => void;
  cambiarPerfil: (p: Perfil) => void;
  cambiarCuartel: (id: string) => void;
  cerrarSesion: () => void;
  crearServicio: (input: Omit<Servicio, 'id' | 'creadoEn' | 'estado'>) => Servicio;
  validarServicio: (servicioId: string, mandoId: string) => void;
  presentarRendicion: (rendicionId: string, mandoId: string) => void;
  marcarNotifLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
  // ABM Persona
  crearPersona: (
    input: Omit<Persona, 'id' | 'avatarUrl' | 'fotoUrl'> & { fotoUrl?: string },
  ) => Persona;
  actualizarPersona: (id: string, cambios: Partial<Persona>) => void;
  archivarPersona: (id: string) => void;
}

type FaroStore = State & Actions;

const initialState: State = {
  hidratado: false,
  sesion: null,
  cuarteles: cuartelesMock,
  personas: personasMock,
  moviles: movilesMock,
  servicios: serviciosMock,
  asistencias: asistenciasMock,
  alertas: alertasMock,
  rendiciones: { [rendicionMayoMock.id]: rendicionMayoMock },
  audit: [],
  notificaciones: notificacionesMock,
};

function recalcularRendicion(state: State, cuartelId: string): State {
  const rendId = 'rend-2026-05';
  const rend = state.rendiciones[rendId];
  if (!rend || rend.cuartelId !== cuartelId) return state;
  const validados = state.servicios.filter(
    (s) => s.cuartelId === cuartelId && s.estado === 'validado',
  ).length;
  const total = state.servicios.filter((s) => s.cuartelId === cuartelId).length;
  const req = rend.requisitos.find((r) => r.id === 'req-servicios');
  if (req) {
    req.avance = total === 0 ? 100 : Math.round((validados / total) * 100);
    req.completo = req.avance >= 100;
    req.descripcion = `${total} servicios registrados${validados < total ? ` — ${total - validados} pendiente(s)` : ' — todos validados'}.`;
  }
  const suma = rend.requisitos.reduce((acc, r) => acc + r.avance, 0);
  rend.porcentaje = Math.round(suma / rend.requisitos.length);
  const cuarteles = state.cuarteles.map((c) =>
    c.id === cuartelId
      ? {
          ...c,
          porcentajeRendicion: rend.porcentaje,
          cumplimiento: (rend.porcentaje >= 95
            ? 'ok'
            : rend.porcentaje >= 70
              ? 'warn'
              : 'risk') as Cuartel['cumplimiento'],
        }
      : c,
  );
  return { ...state, rendiciones: { ...state.rendiciones, [rendId]: { ...rend } }, cuarteles };
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const useFaroStore = create<FaroStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      iniciarSesion(personaId, cuartelId, perfilActivo) {
        const persona = get().personas.find((p) => p.id === personaId);
        if (!persona) return;
        const sesion: SesionUsuario = {
          personaId,
          cuartelId,
          perfilActivo,
          perfilesDisponibles: persona.perfiles,
          cuartelesDisponibles: get().cuarteles.map((c) => c.id),
          iniciadaEn: new Date().toISOString(),
        };
        set({ sesion });
      },
      cambiarPerfil(perfil) {
        const s = get().sesion;
        if (s) set({ sesion: { ...s, perfilActivo: perfil } });
      },
      cambiarCuartel(cuartelId) {
        const s = get().sesion;
        if (s) set({ sesion: { ...s, cuartelId } });
      },
      cerrarSesion() {
        set({ sesion: null });
      },
      crearServicio(input) {
        const servicio: Servicio = {
          ...input,
          id: genId('srv'),
          creadoEn: new Date().toISOString(),
          estado: 'pendiente_validacion',
        };
        const horas = Math.max(
          1,
          Math.round(
            (new Date(input.horaRegreso).getTime() - new Date(input.horaSalida).getTime()) / 3.6e6,
          ),
        );
        const fecha = input.horaSalida.slice(0, 10);
        const nuevas: Asistencia[] = input.dotacionIds.map((pid, idx) => ({
          id: `asist-${servicio.id}-${idx}`,
          cuartelId: input.cuartelId,
          personaId: pid,
          fecha,
          tipo: 'accidental',
          horas,
          servicioId: servicio.id,
        }));
        const after = {
          ...get(),
          servicios: [servicio, ...get().servicios],
          asistencias: [...nuevas, ...get().asistencias],
        };
        set(recalcularRendicion(after, input.cuartelId));
        return servicio;
      },
      validarServicio(servicioId, mandoId) {
        const servicios = get().servicios.map((s) =>
          s.id === servicioId
            ? {
                ...s,
                estado: 'validado' as const,
                confirmadoPor: mandoId,
                confirmadoEn: new Date().toISOString(),
              }
            : s,
        );
        const after = { ...get(), servicios };
        const cuartelId = servicios.find((s) => s.id === servicioId)?.cuartelId;
        set(cuartelId ? recalcularRendicion(after, cuartelId) : after);
      },
      marcarNotifLeida(id) {
        set({
          notificaciones: get().notificaciones.map((n) =>
            n.id === id ? { ...n, leida: true } : n,
          ),
        });
      },
      marcarTodasLeidas() {
        set({ notificaciones: get().notificaciones.map((n) => ({ ...n, leida: true })) });
      },
      crearPersona(input) {
        const persona: Persona = {
          ...input,
          id: genId('persona'),
        } as Persona;
        set({ personas: [...get().personas, persona] });
        return persona;
      },
      actualizarPersona(id, cambios) {
        set({
          personas: get().personas.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
        });
      },
      archivarPersona(id) {
        set({
          personas: get().personas.map((p) =>
            p.id === id ? { ...p, estado: 'baja' as Persona['estado'] } : p,
          ),
        });
      },
      presentarRendicion(rendicionId, mandoId) {
        const r = get().rendiciones[rendicionId];
        if (!r) return;
        set({
          rendiciones: {
            ...get().rendiciones,
            [rendicionId]: {
              ...r,
              estado: 'presentada',
              presentadaEn: new Date().toISOString(),
              presentadaPor: mandoId,
              porcentaje: 100,
            },
          },
          cuarteles: get().cuarteles.map((c) =>
            c.id === r.cuartelId ? { ...c, porcentajeRendicion: 100, cumplimiento: 'ok' } : c,
          ),
        });
      },
    }),
    {
      name: 'faro-store',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sesion: s.sesion,
        servicios: s.servicios,
        asistencias: s.asistencias,
        rendiciones: s.rendiciones,
        cuarteles: s.cuarteles,
        notificaciones: s.notificaciones,
      }),
      migrate: () => initialState,
      onRehydrateStorage: () => (state) => {
        if (state) state.hidratado = true;
      },
    },
  ),
);

export function selectPersonaActual(s: FaroStore) {
  if (!s.sesion) return undefined;
  return s.personas.find((p) => p.id === s.sesion!.personaId);
}
export function selectCuartelActivo(s: FaroStore) {
  if (!s.sesion) return undefined;
  return s.cuarteles.find((c) => c.id === s.sesion!.cuartelId);
}
export function selectServiciosDelCuartel(s: FaroStore) {
  if (!s.sesion) return [];
  return s.servicios.filter((sv) => sv.cuartelId === s.sesion!.cuartelId);
}
export function selectComputoActual(s: FaroStore, mes: string) {
  if (!s.sesion) return [];
  return calcularComputoMensual(s.asistencias, s.sesion.cuartelId, mes);
}
export function selectRendicionActual(s: FaroStore) {
  if (!s.sesion) return undefined;
  return Object.values(s.rendiciones).find(
    (r) => r.cuartelId === s.sesion!.cuartelId && r.periodo === '2026-05',
  );
}
export function selectAlertasCuartel(s: FaroStore) {
  if (!s.sesion) return [];
  return s.alertas.filter((a) => a.cuartelId === s.sesion!.cuartelId);
}
