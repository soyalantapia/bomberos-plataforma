import type { ContactoRed } from '@faro/types';

function mk(
  id: string,
  nombre: string,
  cargo: string,
  organismo: string | undefined,
  telefonos: string[],
  categoria: ContactoRed['categoria'],
  nivel: ContactoRed['nivel'],
  scope: { regionId?: string; cuartelId?: string },
  extras: Partial<ContactoRed> = {},
): ContactoRed {
  return {
    id,
    nombre,
    cargo,
    organismo,
    telefonos,
    categoria,
    nivel,
    regionId: scope.regionId,
    cuartelId: scope.cuartelId,
    agregadoPor: extras.agregadoPor ?? 'sm-001',
    agregadoEn: extras.agregadoEn ?? '2026-03-15T10:00:00',
    usosTotal: extras.usosTotal ?? 0,
    activo: extras.activo ?? true,
    ...extras,
  };
}

export const contactosRedMock: ContactoRed[] = [
  // ─────────────────────────────────────────────────────────────
  // NIVEL FEDERACIÓN — contactos top, curados por Consejo Directivo
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-fed-001',
    'Mariano Cascallares',
    'Director Nacional de Protección Civil',
    'DNPC · Ministerio de Seguridad',
    ['+54 11 4346-1500'],
    'gobierno',
    'federacion',
    {},
    {
      email: 'mcascallares@minseg.gob.ar',
      notas: 'Atiende por email durante la semana. Para urgencias, llamar a su jefe de gabinete.',
      tags: ['dnpc', 'rendiciones', 'subsidios'],
      usosTotal: 14,
      ultimoUso: { personaId: 'sm-001', fecha: '2026-05-20T11:30:00', tipo: 'email' },
    },
  ),
  mk(
    'cr-fed-002',
    'Sebastián Cocchi',
    'Presidente Consejo Federacional',
    'Consejo Federal Bomberos Voluntarios',
    ['+54 11 5555-2200', '+54 11 5555-2201'],
    'gobierno',
    'federacion',
    {},
    {
      email: 'presidencia@bomberosra.org.ar',
      whatsapp: '+54 11 5555-2200',
      tags: ['consejo-federal', 'mesa-bomberos'],
      usosTotal: 22,
      ultimoUso: { personaId: 'sm-001', fecha: '2026-05-18T15:00:00', tipo: 'whatsapp' },
    },
  ),
  mk(
    'cr-fed-003',
    'Andrea Mottura',
    'Coordinadora RUBA',
    'RUBA · Sistema Nacional Bomberos Voluntarios',
    ['+54 11 4382-9100'],
    'gobierno',
    'federacion',
    {},
    {
      email: 'soporte@ruba.org.ar',
      notas: 'Mejor escribir por email para temas de carga de personal. Responde en 24-48hs.',
      tags: ['ruba', 'altas-bajas', 'compliance'],
      usosTotal: 8,
    },
  ),
  mk(
    'cr-fed-004',
    'Javier Alonso',
    'Ministro de Seguridad PBA',
    'Gobierno Provincia Buenos Aires',
    ['+54 221 425-8800'],
    'gobierno',
    'federacion',
    {},
    {
      email: 'despacho@minseg.gba.gob.ar',
      tags: ['provincial', 'seguridad'],
      usosTotal: 3,
    },
  ),
  mk(
    'cr-fed-005',
    'Marina Aizen',
    'Periodista — Editora Seguridad',
    'Diario Clarín',
    ['+54 11 4309-7100'],
    'medios',
    'federacion',
    {},
    {
      email: 'maizen@clarin.com',
      whatsapp: '+54 11 6133-2200',
      notas: 'Hace coberturas de bomberos hace años. Trato directo, suele citar bien.',
      tags: ['prensa-nacional', 'cobertura'],
      usosTotal: 6,
    },
  ),
  mk(
    'cr-fed-006',
    'Dr. Roberto Fernández',
    'Director Hospital Posadas',
    'Hospital Nacional Posadas',
    ['+54 11 4469-9300'],
    'salud',
    'federacion',
    {},
    {
      direccion: 'Av. Pres. Illia s/n, El Palomar',
      notas: 'Hospital de referencia para grandes derivaciones desde toda la federación.',
      tags: ['hospital', 'derivaciones', 'gran-buenos-aires'],
      usosTotal: 11,
      ultimoUso: { personaId: 'mo-001', fecha: '2026-05-22T03:15:00', tipo: 'llamada' },
    },
  ),
  mk(
    'cr-fed-007',
    'Comisionado Hugo Salgado',
    'Director Defensa Civil PBA',
    'Defensa Civil Provincia Buenos Aires',
    ['+54 221 429-5450', '+54 221 429-5451'],
    'seguridad',
    'federacion',
    {},
    {
      email: 'defensacivil@gba.gob.ar',
      tags: ['provincial', 'coordinacion', 'mega-evento'],
      usosTotal: 5,
    },
  ),
  mk(
    'cr-fed-008',
    'Carlos Bianchi',
    'Director Comercial — Convenio Combustible',
    'YPF Cuentas Especiales',
    ['+54 11 5441-2000'],
    'logistica',
    'federacion',
    {},
    {
      email: 'cbianchi@ypf.com',
      notas: 'Maneja el convenio nacional de combustible subsidiado para cuarteles.',
      tags: ['ypf', 'combustible', 'convenio'],
      usosTotal: 4,
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL REGIÓN — Norte GBA
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-reg-n-001',
    'Pablo Rotondaro',
    'Jefe Defensa Civil Zona Norte',
    'Defensa Civil PBA · Región Norte',
    ['+54 11 4742-8800'],
    'seguridad',
    'region',
    { regionId: 'norte-gba' },
    {
      whatsapp: '+54 11 4742-8800',
      tags: ['coordinacion-regional'],
      usosTotal: 17,
      ultimoUso: { personaId: 'sm-001', fecha: '2026-05-24T09:00:00', tipo: 'whatsapp' },
    },
  ),
  mk(
    'cr-reg-n-002',
    'Dra. Silvia Ocampo',
    'Jefa de Guardia Hospital Central San Isidro',
    'Hospital Central de San Isidro',
    ['+54 11 4512-6500'],
    'salud',
    'region',
    { regionId: 'norte-gba' },
    {
      direccion: 'Av. Centenario 1234, San Isidro',
      notas:
        'Coordina derivaciones de cuarteles del norte. Atender preferentemente en horario diurno.',
      tags: ['guardia', 'derivaciones'],
      usosTotal: 9,
    },
  ),
  mk(
    'cr-reg-n-003',
    'Esteban Acerbo',
    'Reportero — Zona Norte',
    'TN Noticias',
    ['+54 11 5544-3300'],
    'medios',
    'region',
    { regionId: 'norte-gba' },
    {
      whatsapp: '+54 11 5544-3300',
      tags: ['prensa-regional', 'cobertura-incidentes'],
      usosTotal: 3,
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL REGIÓN — Sur GBA
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-reg-s-001',
    'Daniel Souza',
    'Jefe Defensa Civil Zona Sur',
    'Defensa Civil PBA · Región Sur',
    ['+54 11 4252-9900'],
    'seguridad',
    'region',
    { regionId: 'sur-gba' },
    {
      whatsapp: '+54 11 4252-9900',
      tags: ['coordinacion-regional'],
      usosTotal: 12,
    },
  ),
  mk(
    'cr-reg-s-002',
    'Dra. Mónica Vázquez',
    'Directora Hospital Evita Lanús',
    'Hospital Evita',
    ['+54 11 4225-7600'],
    'salud',
    'region',
    { regionId: 'sur-gba' },
    {
      direccion: 'Río de Janeiro 1910, Lanús Oeste',
      tags: ['hospital', 'derivaciones-sur'],
      usosTotal: 6,
    },
  ),
  mk(
    'cr-reg-s-003',
    'Roberto Casas',
    'Gerente Operativo Edesur',
    'Edesur',
    ['+54 11 4555-7777'],
    'servicios',
    'region',
    { regionId: 'sur-gba' },
    {
      email: 'rcasas@edesur.com.ar',
      notas: 'Cortes de luz programados o emergencia eléctrica con riesgo de incendio.',
      tags: ['energia', 'electrico'],
      usosTotal: 4,
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL REGIÓN — Oeste GBA
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-reg-o-001',
    'Lautaro Méndez',
    'Jefe Defensa Civil Zona Oeste',
    'Defensa Civil PBA · Región Oeste',
    ['+54 11 4661-2400'],
    'seguridad',
    'region',
    { regionId: 'oeste-gba' },
    {
      whatsapp: '+54 11 4661-2400',
      tags: ['coordinacion-regional'],
      usosTotal: 8,
    },
  ),
  mk(
    'cr-reg-o-002',
    'Dr. Fernando Toledo',
    'Director Hospital Posadas — Coordinación Bomberos',
    'Hospital Posadas',
    ['+54 11 4469-9355'],
    'salud',
    'region',
    { regionId: 'oeste-gba' },
    {
      notas: 'Coordinador específico para derivaciones de bomberos voluntarios.',
      tags: ['hospital', 'coordinacion'],
      usosTotal: 7,
      ultimoUso: { personaId: 'mo-001', fecha: '2026-05-23T22:40:00', tipo: 'llamada' },
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — San Martín
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-sm-001',
    'Fernando Moreira',
    'Intendente',
    'Municipalidad de General San Martín',
    ['+54 11 4830-1000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-san-martin' },
    {
      email: 'intendente@sanmartin.gov.ar',
      whatsapp: '+54 11 4830-1000',
      tags: ['intendente', 'subsidios-municipales'],
      usosTotal: 8,
      agregadoPor: 'sm-001',
    },
  ),
  mk(
    'cr-c-sm-002',
    'Comisario Inspector Ortega',
    'Jefe Comisaría 3ra San Martín',
    'Policía Bonaerense',
    ['+54 11 4754-2233'],
    'seguridad',
    'cuartel',
    { cuartelId: 'cuartel-san-martin' },
    {
      direccion: 'Belgrano 2435, San Martín',
      tags: ['comisaria', 'colaboracion-operativa'],
      usosTotal: 15,
      agregadoPor: 'sm-002',
    },
  ),
  mk(
    'cr-c-sm-003',
    'Lic. Patricia Ríos',
    'Jefa de Comunicación',
    'Municipalidad General San Martín',
    ['+54 11 4830-1212'],
    'medios',
    'cuartel',
    { cuartelId: 'cuartel-san-martin' },
    {
      email: 'comunicacion@sanmartin.gov.ar',
      whatsapp: '+54 11 6677-8800',
      notas: 'Buena onda. Difunde nuestras campañas y comunicados sin pedir tanto.',
      tags: ['prensa-municipal', 'difusion'],
      usosTotal: 5,
      agregadoPor: 'sm-008',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — San Isidro
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-si-001',
    'Ramón Lanús',
    'Intendente',
    'Municipalidad de San Isidro',
    ['+54 11 4512-3000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-san-isidro' },
    {
      email: 'intendente@sanisidro.gov.ar',
      tags: ['intendente'],
      usosTotal: 4,
      agregadoPor: 'si-001',
    },
  ),
  mk(
    'cr-c-si-002',
    'Dr. Marcelo Berini',
    'Director Hospital Materno Infantil',
    'Hospital Materno Infantil San Isidro',
    ['+54 11 4747-1300'],
    'salud',
    'cuartel',
    { cuartelId: 'cuartel-san-isidro' },
    {
      direccion: 'Diego Palma 505, San Isidro',
      notas: 'Hospital de referencia para todo San Isidro y Beccar.',
      tags: ['hospital'],
      usosTotal: 9,
      agregadoPor: 'si-002',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Tigre
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-tg-001',
    'Julio Zamora',
    'Intendente',
    'Municipalidad de Tigre',
    ['+54 11 4512-4444'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-tigre' },
    {
      email: 'jzamora@tigre.gob.ar',
      whatsapp: '+54 11 4512-4444',
      tags: ['intendente', 'islas'],
      usosTotal: 6,
      agregadoPor: 'tg-001',
    },
  ),
  mk(
    'cr-c-tg-002',
    'Prefecto Mariano Castro',
    'Jefe Prefectura Tigre',
    'Prefectura Naval Argentina',
    ['+54 11 4749-1010'],
    'seguridad',
    'cuartel',
    { cuartelId: 'cuartel-tigre' },
    {
      notas: 'Coordinar rescates en el delta. Tiene lanchas disponibles para urgencias.',
      tags: ['prefectura', 'delta', 'rescate-acuatico'],
      usosTotal: 11,
      ultimoUso: { personaId: 'tg-001', fecha: '2026-05-21T16:20:00', tipo: 'llamada' },
      agregadoPor: 'tg-001',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Villa Ballester
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-vb-001',
    'Carlos Russo',
    'Director Hospital Belgrano',
    'Hospital Belgrano',
    ['+54 11 4754-4500'],
    'salud',
    'cuartel',
    { cuartelId: 'cuartel-villa-ballester' },
    {
      direccion: 'Av. Belgrano 1969, Villa Ballester',
      tags: ['hospital'],
      usosTotal: 14,
      agregadoPor: 'persona-001',
    },
  ),
  mk(
    'cr-c-vb-002',
    'Ferretería El Tornillo',
    'Proveedor 24hs',
    'Ferretería El Tornillo',
    ['+54 11 4768-2233'],
    'logistica',
    'cuartel',
    { cuartelId: 'cuartel-villa-ballester' },
    {
      direccion: 'Belgrano 4500, Villa Ballester',
      notas: 'Tiene guardia 24hs. Le compramos repuestos chicos cuando hace falta.',
      tags: ['proveedor', '24hs'],
      usosTotal: 22,
      agregadoPor: 'persona-002',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Quilmes
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-qm-001',
    'Mayra Mendoza',
    'Intendenta',
    'Municipalidad de Quilmes',
    ['+54 11 4250-3000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-quilmes' },
    {
      tags: ['intendente'],
      usosTotal: 3,
      agregadoPor: 'qm-001',
    },
  ),
  mk(
    'cr-c-qm-002',
    'Aysa Quilmes',
    'Atención Operativa',
    'Aysa',
    ['0800-321-2482'],
    'servicios',
    'cuartel',
    { cuartelId: 'cuartel-quilmes' },
    {
      notas: 'Cortes de agua o problemas de red en zona Quilmes.',
      tags: ['agua', 'servicio-publico'],
      usosTotal: 7,
      agregadoPor: 'qm-002',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Lomas de Zamora
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-lz-001',
    'Federico Otermín',
    'Intendente',
    'Municipalidad de Lomas de Zamora',
    ['+54 11 4239-9000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-lomas-zamora' },
    {
      email: 'intendencia@lomasdezamora.gov.ar',
      tags: ['intendente'],
      usosTotal: 2,
      agregadoPor: 'lz-001',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Lanús
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-ln-001',
    'Julián Álvarez',
    'Intendente',
    'Municipalidad de Lanús',
    ['+54 11 4357-5000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-lanus' },
    {
      tags: ['intendente'],
      usosTotal: 5,
      agregadoPor: 'ln-001',
    },
  ),
  mk(
    'cr-c-ln-002',
    'Lic. Rodrigo Sosa',
    'Periodista — Lanús',
    'Diario La Unión',
    ['+54 11 6677-9988'],
    'medios',
    'cuartel',
    { cuartelId: 'cuartel-lanus' },
    {
      whatsapp: '+54 11 6677-9988',
      notas: 'Cubre todo lo de bomberos en Lanús. Mandar gacetillas por whatsapp.',
      tags: ['prensa-local'],
      usosTotal: 9,
      agregadoPor: 'ln-001',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Morón
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-mo-001',
    'Lucas Ghi',
    'Intendente',
    'Municipalidad de Morón',
    ['+54 11 4489-7700'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-moron' },
    {
      email: 'intendente@moron.gov.ar',
      tags: ['intendente', 'subsidios'],
      usosTotal: 11,
      agregadoPor: 'mo-001',
    },
  ),
  mk(
    'cr-c-mo-002',
    'Comisaría 1ra Morón',
    'Guardia 24hs',
    'Policía Bonaerense',
    ['+54 11 4629-1213'],
    'seguridad',
    'cuartel',
    { cuartelId: 'cuartel-moron' },
    {
      direccion: 'Brown 944, Morón',
      tags: ['comisaria', 'urgencias'],
      usosTotal: 26,
      ultimoUso: { personaId: 'mo-001', fecha: '2026-05-25T02:10:00', tipo: 'llamada' },
      agregadoPor: 'mo-001',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Tres de Febrero
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-tf-001',
    'Diego Valenzuela',
    'Intendente',
    'Municipalidad de Tres de Febrero',
    ['+54 11 4734-3000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-tres-de-febrero' },
    {
      tags: ['intendente'],
      usosTotal: 1,
      agregadoPor: 'tf-001',
    },
  ),

  // ─────────────────────────────────────────────────────────────
  // NIVEL CUARTEL — Ituzaingó
  // ─────────────────────────────────────────────────────────────
  mk(
    'cr-c-iz-001',
    'Pablo Descalzo',
    'Intendente',
    'Municipalidad de Ituzaingó',
    ['+54 11 4624-5000'],
    'gobierno',
    'cuartel',
    { cuartelId: 'cuartel-ituzaingo' },
    {
      tags: ['intendente'],
      usosTotal: 2,
      agregadoPor: 'iz-001',
    },
  ),
  mk(
    'cr-c-iz-002',
    'Hospital Carrillo Ituzaingó',
    'Guardia Central',
    'Hospital Ramón Carrillo',
    ['+54 11 4624-1100'],
    'salud',
    'cuartel',
    { cuartelId: 'cuartel-ituzaingo' },
    {
      direccion: 'Brandsen 950, Ituzaingó',
      tags: ['hospital', 'guardia'],
      usosTotal: 13,
      agregadoPor: 'iz-002',
    },
  ),
];
