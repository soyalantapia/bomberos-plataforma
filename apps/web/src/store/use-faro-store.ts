'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
  Alerta,
  Asistencia,
  AuditEvent,
  Caja,
  Calificacion,
  ConciliacionBancaria,
  ContactoRed,
  Cuartel,
  CuentaContable,
  CuotaSocial,
  Destacamento,
  Fichaje,
  MiembroConsejo,
  MovimientoFinanciero,
  Movil,
  Notificacion,
  Perfil,
  Persona,
  PresupuestoAnual,
  Reconocimiento,
  RegionInfo,
  Rendicion,
  Sector,
  Servicio,
  SesionUsuario,
  Tarea,
  TareaEvento,
  TipoReconocimiento,
} from '@faro/types';

import {
  alertasMock,
  asistenciasMock,
  cajasMock,
  calificacionesMock,
  conciliacionesMock,
  consejoMock,
  contactosRedMock,
  cuartelesMock,
  cuentasMock,
  cuotasMock,
  destacamentosMock,
  fichajesMock,
  movimientosMock,
  movilesMock,
  notificacionesMock,
  personasFederacionMock,
  personasMock,
  presupuestoMock,
  reconocimientosMock,
  regionesMock,
  rendicionMayoMock,
  sectoresMock,
  serviciosMock,
  tareasMock,
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
  // FINANZAS
  cuentas: CuentaContable[];
  cajas: Caja[];
  movimientos: MovimientoFinanciero[];
  cuotas: CuotaSocial[];
  presupuestos: PresupuestoAnual[];
  conciliaciones: ConciliacionBancaria[];
  // FEDERACIÓN
  personasFederacion: Persona[];
  regiones: RegionInfo[];
  contactosRed: ContactoRed[];
  // ORGANIZACIÓN
  consejo: MiembroConsejo[];
  sectores: Sector[];
  destacamentos: Destacamento[];
  tareas: Tarea[];
  // PERSONAL Y CUMPLIMIENTO
  fichajes: Fichaje[];
  reconocimientos: Reconocimiento[];
  calificaciones: Calificacion[];
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
  // ABM Móvil
  crearMovil: (input: Omit<Movil, 'id'>) => Movil;
  actualizarMovil: (id: string, cambios: Partial<Movil>) => void;
  // FINANZAS
  crearMovimiento: (
    input: Omit<MovimientoFinanciero, 'id' | 'cargadoEn' | 'cargadoPor' | 'estado'> & {
      estado?: MovimientoFinanciero['estado'];
    },
  ) => MovimientoFinanciero;
  actualizarMovimiento: (id: string, cambios: Partial<MovimientoFinanciero>) => void;
  conciliarMovimiento: (id: string) => void;
  anularMovimiento: (id: string, motivo: string) => void;
  crearCaja: (input: Omit<Caja, 'id'>) => Caja;
  actualizarCaja: (id: string, cambios: Partial<Caja>) => void;
  transferirEntreCajas: (
    origen: string,
    destino: string,
    monto: number,
    descripcion: string,
  ) => void;
  cobrarCuota: (id: string, medio: MovimientoFinanciero['medio'], cajaId: string) => void;
  // FEDERACIÓN — ContactoRed
  agregarContactoRed: (
    input: Omit<ContactoRed, 'id' | 'agregadoPor' | 'agregadoEn' | 'usosTotal' | 'activo'>,
  ) => ContactoRed;
  actualizarContactoRed: (id: string, cambios: Partial<ContactoRed>) => void;
  archivarContactoRed: (id: string) => void;
  registrarUsoContactoRed: (id: string, tipo: 'llamada' | 'whatsapp' | 'email') => void;
  // TAREAS POR SECTOR
  crearTarea: (
    input: Omit<Tarea, 'id' | 'creadaEn' | 'estado' | 'historial' | 'prioridad'> & {
      prioridad?: Tarea['prioridad'];
    },
  ) => Tarea;
  tomarTarea: (id: string) => void;
  marcarTareaHecha: (id: string, comentario?: string) => void;
  bloquearTarea: (id: string, motivo: string) => void;
  validarTarea: (id: string) => void;
  reabrirTarea: (id: string, nota?: string) => void;
  // PERSONAL Y CUMPLIMIENTO
  ficharIngreso: (personaId: string, destacamentoId?: string, actividad?: string) => Fichaje;
  ficharEgreso: (fichajeId: string) => void;
  registrarReconocimiento: (personaId: string, tipo: TipoReconocimiento, motivo: string) => void;
  calificar: (personaId: string, periodo: string, puntaje: number, nota?: string) => void;
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
  // FINANZAS
  cuentas: cuentasMock,
  cajas: cajasMock,
  movimientos: movimientosMock,
  cuotas: cuotasMock,
  presupuestos: [presupuestoMock],
  conciliaciones: conciliacionesMock,
  // FEDERACIÓN
  personasFederacion: personasFederacionMock,
  regiones: regionesMock,
  contactosRed: contactosRedMock,
  // ORGANIZACIÓN
  consejo: consejoMock,
  sectores: sectoresMock,
  destacamentos: destacamentosMock,
  tareas: tareasMock,
  // PERSONAL Y CUMPLIMIENTO
  fichajes: fichajesMock,
  reconocimientos: reconocimientosMock,
  calificaciones: calificacionesMock,
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
      crearMovil(input) {
        const movil: Movil = { ...input, id: genId('movil') };
        set({ moviles: [...get().moviles, movil] });
        return movil;
      },
      actualizarMovil(id, cambios) {
        set({
          moviles: get().moviles.map((m) => (m.id === id ? { ...m, ...cambios } : m)),
        });
      },
      // ====== FINANZAS ======
      crearMovimiento(input) {
        const personaId = get().sesion?.personaId ?? 'sistema';
        const mov: MovimientoFinanciero = {
          ...input,
          id: genId('mov'),
          cargadoEn: new Date().toISOString(),
          cargadoPor: personaId,
          estado: input.estado ?? 'borrador',
        };
        // Actualizar saldos
        let cajas = get().cajas;
        if (mov.tipo === 'ingreso' && mov.cajaOrigenId) {
          cajas = cajas.map((c) =>
            c.id === mov.cajaOrigenId ? { ...c, saldoActual: c.saldoActual + mov.monto } : c,
          );
        } else if (mov.tipo === 'egreso' && mov.cajaOrigenId) {
          cajas = cajas.map((c) =>
            c.id === mov.cajaOrigenId ? { ...c, saldoActual: c.saldoActual - mov.monto } : c,
          );
        } else if (mov.tipo === 'transferencia' && mov.cajaOrigenId && mov.cajaDestinoId) {
          cajas = cajas.map((c) => {
            if (c.id === mov.cajaOrigenId) return { ...c, saldoActual: c.saldoActual - mov.monto };
            if (c.id === mov.cajaDestinoId) return { ...c, saldoActual: c.saldoActual + mov.monto };
            return c;
          });
        }
        set({
          movimientos: [mov, ...get().movimientos],
          cajas,
        });
        return mov;
      },
      actualizarMovimiento(id, cambios) {
        set({
          movimientos: get().movimientos.map((m) => (m.id === id ? { ...m, ...cambios } : m)),
        });
      },
      conciliarMovimiento(id) {
        set({
          movimientos: get().movimientos.map((m) =>
            m.id === id ? { ...m, estado: 'conciliado' as const } : m,
          ),
        });
      },
      anularMovimiento(id, motivo) {
        const mov = get().movimientos.find((m) => m.id === id);
        if (!mov) return;
        // Revertir saldo
        let cajas = get().cajas;
        if (mov.tipo === 'ingreso' && mov.cajaOrigenId) {
          cajas = cajas.map((c) =>
            c.id === mov.cajaOrigenId ? { ...c, saldoActual: c.saldoActual - mov.monto } : c,
          );
        } else if (mov.tipo === 'egreso' && mov.cajaOrigenId) {
          cajas = cajas.map((c) =>
            c.id === mov.cajaOrigenId ? { ...c, saldoActual: c.saldoActual + mov.monto } : c,
          );
        }
        set({
          movimientos: get().movimientos.map((m) =>
            m.id === id
              ? { ...m, estado: 'anulado' as const, notas: `${m.notas ?? ''}\n[Anulado] ${motivo}` }
              : m,
          ),
          cajas,
        });
      },
      crearCaja(input) {
        const caja: Caja = { ...input, id: genId('caja') };
        set({ cajas: [...get().cajas, caja] });
        return caja;
      },
      actualizarCaja(id, cambios) {
        set({
          cajas: get().cajas.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
        });
      },
      transferirEntreCajas(origenId, destinoId, monto, descripcion) {
        const personaId = get().sesion?.personaId ?? 'sistema';
        const cuartelId = get().sesion?.cuartelId ?? cuartelesMock[0]!.id;
        const mov: MovimientoFinanciero = {
          id: genId('mov'),
          cuartelId,
          tipo: 'transferencia',
          fecha: new Date().toISOString(),
          monto,
          cuentaId: 'c-1-1', // disponibilidades
          cajaOrigenId: origenId,
          cajaDestinoId: destinoId,
          medio: 'transferencia',
          descripcion: descripcion || 'Transferencia interna',
          estado: 'conciliado',
          cargadoPor: personaId,
          cargadoEn: new Date().toISOString(),
        };
        const cajas = get().cajas.map((c) => {
          if (c.id === origenId) return { ...c, saldoActual: c.saldoActual - monto };
          if (c.id === destinoId) return { ...c, saldoActual: c.saldoActual + monto };
          return c;
        });
        set({ movimientos: [mov, ...get().movimientos], cajas });
      },
      cobrarCuota(id, medio, cajaId) {
        const cuota = get().cuotas.find((c) => c.id === id);
        if (!cuota) return;
        const personaId = get().sesion?.personaId ?? 'sistema';
        const totalACobrar = cuota.monto + (cuota.cargoRecargo ?? 0);
        const mov: MovimientoFinanciero = {
          id: genId('mov'),
          cuartelId: cuota.cuartelId,
          tipo: 'ingreso',
          fecha: new Date().toISOString(),
          monto: totalACobrar,
          cuentaId: 'c-4-2-01',
          cajaOrigenId: cajaId,
          medio,
          descripcion: `Cuota social ${cuota.periodo} · ${cuota.socioNombre}`,
          contraparte: cuota.socioNombre,
          estado: 'conciliado',
          cargadoPor: personaId,
          cargadoEn: new Date().toISOString(),
        };
        const cajas = get().cajas.map((c) =>
          c.id === cajaId ? { ...c, saldoActual: c.saldoActual + totalACobrar } : c,
        );
        set({
          movimientos: [mov, ...get().movimientos],
          cuotas: get().cuotas.map((c) =>
            c.id === id
              ? {
                  ...c,
                  estado: 'pagada' as const,
                  pagadoEn: new Date().toISOString(),
                  medio,
                  movimientoId: mov.id,
                }
              : c,
          ),
          cajas,
        });
      },
      // ====== FEDERACIÓN — ContactoRed ======
      agregarContactoRed(input) {
        const personaId = get().sesion?.personaId ?? 'sistema';
        const contacto: ContactoRed = {
          ...input,
          id: genId('cr'),
          agregadoPor: personaId,
          agregadoEn: new Date().toISOString(),
          usosTotal: 0,
          activo: true,
        };
        set({ contactosRed: [contacto, ...get().contactosRed] });
        return contacto;
      },
      actualizarContactoRed(id, cambios) {
        set({
          contactosRed: get().contactosRed.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
        });
      },
      archivarContactoRed(id) {
        set({
          contactosRed: get().contactosRed.map((c) => (c.id === id ? { ...c, activo: false } : c)),
        });
      },
      registrarUsoContactoRed(id, tipo) {
        const personaId = get().sesion?.personaId ?? 'sistema';
        set({
          contactosRed: get().contactosRed.map((c) =>
            c.id === id
              ? {
                  ...c,
                  usosTotal: c.usosTotal + 1,
                  ultimoUso: { personaId, fecha: new Date().toISOString(), tipo },
                }
              : c,
          ),
        });
      },
      // ====== TAREAS POR SECTOR ======
      crearTarea(input) {
        const actor = get().sesion?.personaId ?? input.asignadaPor;
        const now = new Date().toISOString();
        const tarea: Tarea = {
          ...input,
          id: genId('tarea'),
          creadaEn: now,
          estado: 'asignada',
          prioridad: input.prioridad ?? 'media',
          historial: [{ fecha: now, actorId: actor, accion: 'asignada' }],
        };
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId: tarea.cuartelId,
          destinatarioId: tarea.asignadaA,
          tipo: 'tarea',
          titulo: 'Nueva tarea asignada',
          descripcion: tarea.titulo,
          leida: false,
          fecha: now,
          linkPagina: '/bombero/tareas',
        };
        set({ tareas: [tarea, ...get().tareas], notificaciones: [notif, ...get().notificaciones] });
        return tarea;
      },
      tomarTarea(id) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const now = new Date().toISOString();
        const ev: TareaEvento = { fecha: now, actorId: actor, accion: 'tomada' };
        set({
          tareas: get().tareas.map((t) =>
            t.id === id ? { ...t, estado: 'en_progreso', historial: [...t.historial, ev] } : t,
          ),
        });
      },
      marcarTareaHecha(id, comentario) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const now = new Date().toISOString();
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return;
        const ev: TareaEvento = { fecha: now, actorId: actor, accion: 'hecha', nota: comentario };
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId: tarea.cuartelId,
          destinatarioId: tarea.asignadaPor,
          tipo: 'tarea',
          titulo: 'Tarea marcada como hecha',
          descripcion: `${tarea.titulo} — esperando tu validación`,
          leida: false,
          fecha: now,
          linkPagina: '/mando/tareas',
        };
        set({
          tareas: get().tareas.map((t) =>
            t.id === id
              ? {
                  ...t,
                  estado: 'hecha',
                  comentarioCierre: comentario,
                  historial: [...t.historial, ev],
                }
              : t,
          ),
          notificaciones: [notif, ...get().notificaciones],
        });
      },
      bloquearTarea(id, motivo) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const now = new Date().toISOString();
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return;
        const ev: TareaEvento = { fecha: now, actorId: actor, accion: 'bloqueada', nota: motivo };
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId: tarea.cuartelId,
          destinatarioId: tarea.asignadaPor,
          tipo: 'tarea',
          titulo: 'Tarea bloqueada',
          descripcion: `${tarea.titulo} — ${motivo}`,
          leida: false,
          fecha: now,
          linkPagina: '/mando/tareas',
        };
        set({
          tareas: get().tareas.map((t) =>
            t.id === id
              ? {
                  ...t,
                  estado: 'bloqueada',
                  motivoBloqueo: motivo,
                  historial: [...t.historial, ev],
                }
              : t,
          ),
          notificaciones: [notif, ...get().notificaciones],
        });
      },
      validarTarea(id) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const now = new Date().toISOString();
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return;
        const ev: TareaEvento = { fecha: now, actorId: actor, accion: 'validada' };
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId: tarea.cuartelId,
          destinatarioId: tarea.asignadaA,
          tipo: 'tarea',
          titulo: 'Tu tarea fue validada',
          descripcion: tarea.titulo,
          leida: false,
          fecha: now,
          linkPagina: '/bombero/tareas',
        };
        set({
          tareas: get().tareas.map((t) =>
            t.id === id
              ? {
                  ...t,
                  estado: 'validada',
                  validadaPor: actor,
                  validadaEn: now,
                  historial: [...t.historial, ev],
                }
              : t,
          ),
          notificaciones: [notif, ...get().notificaciones],
        });
      },
      reabrirTarea(id, nota) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const now = new Date().toISOString();
        const tarea = get().tareas.find((t) => t.id === id);
        if (!tarea) return;
        const ev: TareaEvento = { fecha: now, actorId: actor, accion: 'reabierta', nota };
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId: tarea.cuartelId,
          destinatarioId: tarea.asignadaA,
          tipo: 'tarea',
          titulo: 'Tu tarea fue reabierta',
          descripcion: nota ? `${tarea.titulo} — ${nota}` : tarea.titulo,
          leida: false,
          fecha: now,
          linkPagina: '/bombero/tareas',
        };
        set({
          tareas: get().tareas.map((t) =>
            t.id === id ? { ...t, estado: 'reabierta', historial: [...t.historial, ev] } : t,
          ),
          notificaciones: [notif, ...get().notificaciones],
        });
      },
      // ====== PERSONAL Y CUMPLIMIENTO ======
      ficharIngreso(personaId, destacamentoId, actividad) {
        const cuartelId = get().sesion?.cuartelId ?? cuartelesMock[0]!.id;
        const fichaje: Fichaje = {
          id: genId('fich'),
          cuartelId,
          destacamentoId,
          personaId,
          ingreso: new Date().toISOString(),
          fuente: 'app',
          actividad,
        };
        set({ fichajes: [fichaje, ...get().fichajes] });
        return fichaje;
      },
      ficharEgreso(fichajeId) {
        set({
          fichajes: get().fichajes.map((f) =>
            f.id === fichajeId && !f.egreso ? { ...f, egreso: new Date().toISOString() } : f,
          ),
        });
      },
      registrarReconocimiento(personaId, tipo, motivo) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const cuartelId = get().sesion?.cuartelId ?? cuartelesMock[0]!.id;
        const now = new Date().toISOString();
        const rec: Reconocimiento = {
          id: genId('rec'),
          cuartelId,
          personaId,
          tipo,
          motivo,
          fecha: now.slice(0, 10),
          otorgadoPor: actor,
        };
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId,
          destinatarioId: personaId,
          tipo: 'reconocimiento',
          titulo: tipo === 'premio' ? 'Recibiste un reconocimiento' : 'Se registró una sanción',
          descripcion: motivo,
          leida: false,
          fecha: now,
          linkPagina: '/bombero/legajo',
        };
        set({
          reconocimientos: [rec, ...get().reconocimientos],
          notificaciones: [notif, ...get().notificaciones],
        });
      },
      calificar(personaId, periodo, puntaje, nota) {
        const actor = get().sesion?.personaId ?? 'sistema';
        const cuartelId = get().sesion?.cuartelId ?? cuartelesMock[0]!.id;
        const now = new Date().toISOString();
        const existente = get().calificaciones.find(
          (c) => c.personaId === personaId && c.periodo === periodo,
        );
        let calificaciones: Calificacion[];
        if (existente) {
          calificaciones = get().calificaciones.map((c) =>
            c.id === existente.id ? { ...c, puntaje, nota, calificadoPor: actor, fecha: now } : c,
          );
        } else {
          const cal: Calificacion = {
            id: genId('cal'),
            cuartelId,
            personaId,
            periodo,
            puntaje,
            nota,
            calificadoPor: actor,
            fecha: now,
          };
          calificaciones = [cal, ...get().calificaciones];
        }
        const notif: Notificacion = {
          id: genId('notif'),
          cuartelId,
          destinatarioId: personaId,
          tipo: 'calificacion',
          titulo: 'Tu calificación mensual está disponible',
          descripcion: `Período ${periodo}`,
          leida: false,
          fecha: now,
          linkPagina: '/bombero/legajo',
        };
        set({ calificaciones, notificaciones: [notif, ...get().notificaciones] });
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
      version: 7,
      storage: createJSONStorage(() => localStorage),
      // Persistimos lo transaccional (sesión, servicios creados, asistencias,
      // rendiciones, notificaciones leídas). NO persistimos estructuras de mock
      // (cuarteles, personas, regiones, contactosRed) — siempre vienen frescas
      // del initialState para que cambios en mocks se reflejen al recargar.
      partialize: (s) => ({
        sesion: s.sesion,
        servicios: s.servicios,
        asistencias: s.asistencias,
        rendiciones: s.rendiciones,
        notificaciones: s.notificaciones,
        tareas: s.tareas,
        fichajes: s.fichajes,
        reconocimientos: s.reconocimientos,
        calificaciones: s.calificaciones,
      }),
      // Mantiene la sesión y el progreso transaccional, pero descarta cualquier
      // estructura de mock que usuarios viejos (v ≤ 6) tengan persistida.
      migrate: (persisted: unknown, fromVersion: number) => {
        if (!persisted || typeof persisted !== 'object') return initialState;
        const p = persisted as Record<string, unknown>;
        if (fromVersion < 7) {
          // En v7 dejamos de persistir mocks estructurales. Para no inyectar
          // los viejos al merge, los borramos antes.
          delete p.cuarteles;
          delete p.personas;
          delete p.personasFederacion;
          delete p.regiones;
          delete p.contactosRed;
        }
        return { ...initialState, ...(p as Partial<State>) };
      },
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
