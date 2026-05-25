/**
 * Schemas Zod para forms de Faro
 *
 * Centraliza validaciones de los wizards y composers para mantener mensajes
 * de error coherentes y reutilizables.
 */
import { z } from 'zod';

// ───────── Servicio (registrar-servicio + parte-nfirs) ─────────
export const tipoServicioZ = z.enum(['incendio', 'rescate', 'accidente', 'forestal', 'otro']);

export const horaHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM (24hs)');

export const servicioRegistroSchema = z
  .object({
    tipo: tipoServicioZ,
    direccion: z.string().trim().min(3, 'Mínimo 3 caracteres').max(200),
    movilId: z.string().min(1, 'Seleccioná un móvil'),
    dotacionIds: z.array(z.string()).min(1, 'Al menos 1 persona en la dotación'),
    horaSalida: horaHHMM,
    horaRegreso: horaHHMM,
    notas: z.string().max(2000).optional(),
  })
  .refine(
    (d) => {
      // hora regreso > hora salida (si son del mismo día)
      const [hs, ms] = d.horaSalida.split(':').map(Number);
      const [hr, mr] = d.horaRegreso.split(':').map(Number);
      return hr! * 60 + mr! > hs! * 60 + ms!;
    },
    { message: 'La hora de regreso debe ser posterior a la de salida', path: ['horaRegreso'] },
  );

// ───────── Parte NFIRS-AR ─────────
export const parteNFIRSSchema = z
  .object({
    tipo: z.string().min(1, 'Tipo de incidente requerido'),
    propiedad: z.string().min(1),
    causa: z.string().min(1),
    ignicion: z.string().trim().min(3, 'Describí el factor de ignición'),
    victimas: z.number().int().min(0, 'No puede ser negativo'),
    heridos: z.number().int().min(0, 'No puede ser negativo'),
    perdidaEstimada: z.number().min(0, 'No puede ser negativo'),
    hectareas: z.number().min(0),
    narrativa: z.string().trim().min(80, 'Mínimo 80 caracteres · sé descriptivo'),
  })
  .refine((d) => (d.tipo.startsWith('13') ? d.hectareas > 0 : true), {
    message: 'Si es forestal, indicá hectáreas afectadas',
    path: ['hectareas'],
  });

// ───────── Broadcast ─────────
export const broadcastSchema = z.object({
  audiencia: z.enum(['todos', 'operativo', 'mando', 'cadetes', 'administrativo', 'custom']),
  titulo: z.string().trim().min(5, 'Mínimo 5 caracteres').max(120, 'Máximo 120 caracteres'),
  cuerpo: z.string().trim().min(20, 'Mínimo 20 caracteres').max(4000, 'Máximo 4000 caracteres'),
  fechaProgramada: z.string().optional(),
});

// ───────── Disponibilidad ─────────
export const disponibilidadSchema = z.object({
  turnos: z.number().int().min(1, 'Declará al menos 1 turno').max(21, 'Demasiados turnos'),
});

// ───────── Rendición ─────────
export const itemRendicionSchema = z.object({
  categoria: z.string().min(1),
  concepto: z.string().trim().min(5),
  monto: z.number().positive('Monto debe ser positivo'),
  comprobante: z.string().min(1, 'Adjuntá comprobante'),
});

export const rendicionPresentarSchema = z.object({
  items: z.array(itemRendicionSchema).min(1, 'Agregá al menos 1 item'),
  aceptaDeclaracion: z.literal(true, {
    message: 'Debés aceptar la declaración jurada para presentar',
  }),
});

// ───────── Persona (crear/editar) ─────────
export const personaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, 'Solo letras'),
  apellido: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, 'Solo letras'),
  legajo: z.string().regex(/^\d{4}$/, 'Legajo de 4 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z
    .string()
    .regex(/^\+?[\d\s-]{8,15}$/, 'Teléfono con 8-15 dígitos')
    .optional()
    .or(z.literal('')),
  dni: z
    .string()
    .regex(/^\d{7,8}$/, 'DNI con 7-8 dígitos')
    .optional()
    .or(z.literal('')),
});

// ───────── Helpers ─────────

/** Tipo helper para extraer errores de Zod en un Record<campo, mensaje> */
export function zodErrorsToRecord(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !result[path]) result[path] = issue.message;
  }
  return result;
}

/** Valida un schema, retorna errors o null */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; errors: Record<string, string> } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, errors: zodErrorsToRecord(r.error) };
}
