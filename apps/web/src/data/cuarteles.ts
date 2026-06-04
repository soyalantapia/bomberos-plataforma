import type { Cuartel } from '@faro/types';

type CuartelMin = {
  nombre: string;
  ciudad?: string;
  region: string;
  provincia?: string;
  lat: number;
  lng: number;
  cumplimiento?: Cuartel['cumplimiento'];
  porcentajeRendicion?: number;
  fundacion?: string;
  matricula?: string;
  jefe?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cumpFor(idx: number): { c: Cuartel['cumplimiento']; p: number } {
  const r = (idx * 17 + 23) % 100;
  if (r >= 85) return { c: 'risk', p: 35 + (r % 35) };
  if (r >= 65) return { c: 'warn', p: 65 + (r % 12) };
  return { c: 'ok', p: 80 + (r % 20) };
}

/**
 * Mapa de slug → logoUrl con escudos reales. Si el slug no aparece acá,
 * el componente `<CuartelLogo>` cae al fallback de iniciales coloreadas
 * por región. Fuentes:
 *   - Norte GBA: sitios institucionales de cada cuartel
 *   - Resto: Federación Bonaerense (fedbonaerense.org.ar)
 */
const LOGO_BY_SLUG: Record<string, string> = {
  // ── Norte GBA ─────────────────────────────────────────────
  // Logo propio (sitio institucional o YouTube channel art)
  'villa-ballester': '/cuarteles/villa-ballester.png',
  'san-martin': '/cuarteles/san-martin.png',
  'san-isidro': '/cuarteles/san-isidro.png',
  tigre: '/cuarteles/tigre.png',
  'vicente-lopez': '/cuarteles/vicente-lopez.png',
  benavidez: '/cuarteles/benavidez.png',
  // Logo desde Instagram (og:image del perfil público)
  'san-fernando': '/cuarteles/san-fernando.png',
  'general-pacheco': '/cuarteles/general-pacheco.png',
  'don-torcuato': '/cuarteles/don-torcuato.png',
  garin: '/cuarteles/garin.png',
  // Destacamentos heredan del cuartel central
  boulogne: '/cuarteles/san-isidro.png',
  florida: '/cuarteles/vicente-lopez.png',
  munro: '/cuarteles/vicente-lopez.png',
  'jose-leon-suarez': '/cuarteles/villa-ballester.png',
  'el-talar': '/cuarteles/tigre.png',
  // ── Oeste GBA ─────────────────────────────────────────────
  moron: '/cuarteles/moron.png',
  'tres-de-febrero': '/cuarteles/tres-de-febrero.png',
  ituzaingo: '/cuarteles/ituzaingo.png',
  hurlingham: '/cuarteles/hurlingham.png',
  merlo: '/cuarteles/merlo.png',
  'ramos-mejia': '/cuarteles/ramos-mejia.png',
  // Destacamentos de La Matanza comparten su escudo institucional:
  //   La Tablada → @bomberos.mejia (=ramos-mejia.png)
  //   González Catán + Laferrere → @bomberosdematanza (=gonzalez-catan.png)
  //   Castelar + Haedo → @bomberosmoron (=moron.png)
  'la-tablada': '/cuarteles/ramos-mejia.png',
  'gonzalez-catan': '/cuarteles/gonzalez-catan.png',
  laferrere: '/cuarteles/gonzalez-catan.png',
  castelar: '/cuarteles/moron.png',
  haedo: '/cuarteles/moron.png',
  // Destacamentos comparten con el cuartel central:
  //   Padua (HQ), Libertad → BV Merlo
  padua: '/cuarteles/merlo.png',
  libertad: '/cuarteles/merlo.png',
  // ── Sur GBA (Federación Bonaerense + Instagram) ──────────
  'almirante-brown': '/cuarteles/almirante-brown.png',
  avellaneda: '/cuarteles/avellaneda.png',
  bernal: '/cuarteles/bernal.png',
  'esteban-echeverria': '/cuarteles/esteban-echeverria.png',
  ezeiza: '/cuarteles/ezeiza.png',
  'florencio-varela': '/cuarteles/florencio-varela.png',
  glew: '/cuarteles/glew.png',
  lanus: '/cuarteles/lanus.png',
  'lomas-de-zamora': '/cuarteles/lomas-de-zamora.png',
  quilmes: '/cuarteles/quilmes.png',
  sarandi: '/cuarteles/sarandi.png',
  berazategui: '/cuarteles/berazategui.png',
  wilde: '/cuarteles/wilde.png',
  // ── La Plata y Sudeste ───────────────────────────────────
  berisso: '/cuarteles/berisso.png',
  brandsen: '/cuarteles/brandsen.png',
  chascomus: '/cuarteles/chascomus.png',
  ensenada: '/cuarteles/ensenada.png',
  magdalena: '/cuarteles/magdalena.png',
  'san-vicente': '/cuarteles/san-vicente.png',
  'la-plata': '/cuarteles/la-plata.png',
  'punta-indio': '/cuarteles/punta-indio.png',
  canuelas: '/cuarteles/canuelas.png',
  'general-belgrano': '/cuarteles/general-belgrano.png',
  // ── Costa Atlántica ──────────────────────────────────────
  'santa-teresita': '/cuarteles/santa-teresita.png',
  pinamar: '/cuarteles/pinamar.png',
  'san-clemente': '/cuarteles/san-clemente.png',
  'general-madariaga': '/cuarteles/general-madariaga.png',
  balcarce: '/cuarteles/balcarce.png',
  loberia: '/cuarteles/loberia.png',
  miramar: '/cuarteles/miramar.png',
  maipu: '/cuarteles/maipu.png',
  'mar-de-ajo': '/cuarteles/mar-de-ajo.png',
  // ── Interior PBA Norte ───────────────────────────────────
  pergamino: '/cuarteles/pergamino.png',
  'general-las-heras': '/cuarteles/general-las-heras.png',
  pilar: '/cuarteles/pilar.png',
  zarate: '/cuarteles/zarate.png',
  'san-pedro': '/cuarteles/san-pedro.png',
  junin: '/cuarteles/junin.png',
  mercedes: '/cuarteles/mercedes.png',
  lujan: '/cuarteles/lujan.png',
  campana: '/cuarteles/campana.png',
  // ── Interior PBA Sur ─────────────────────────────────────
  'bahia-blanca': '/cuarteles/bahia-blanca.png',
  olavarria: '/cuarteles/olavarria.png',
  'tres-arroyos': '/cuarteles/tres-arroyos.png',
};

function mk(min: CuartelMin, idx: number, matriculaNum: number): Cuartel {
  const slug = slugify(min.nombre);
  const id = `cuartel-${slug}`;
  const cump = cumpFor(idx);
  return {
    id,
    nombre: min.nombre,
    ciudad: min.ciudad ?? min.nombre,
    provincia: min.provincia ?? 'Buenos Aires',
    region: min.region,
    lat: min.lat,
    lng: min.lng,
    cumplimiento: min.cumplimiento ?? cump.c,
    porcentajeRendicion: min.porcentajeRendicion ?? cump.p,
    fundacion:
      min.fundacion ??
      `19${20 + (idx % 70)}-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`,
    matricula: min.matricula ?? `BV-${matriculaNum.toString().padStart(4, '0')}`,
    jefe: min.jefe,
    logoUrl: LOGO_BY_SLUG[slug],
  };
}

const REGIONES_DATOS: Array<{ region: string; cuarteles: CuartelMin[] }> = [
  // ── REGIÓN 1 · NORTE GBA (15) ─────────────────────────────────
  {
    region: 'Norte GBA',
    cuarteles: [
      {
        nombre: 'Villa Ballester',
        region: 'Norte GBA',
        lat: -34.5476,
        lng: -58.5556,
        cumplimiento: 'warn',
        porcentajeRendicion: 78,
        fundacion: '1923-04-15',
        matricula: 'BV-0081',
        jefe: 'Roberto González',
      },
      {
        nombre: 'San Martín',
        ciudad: 'General San Martín',
        region: 'Norte GBA',
        lat: -34.5826,
        lng: -58.5374,
        cumplimiento: 'ok',
        porcentajeRendicion: 96,
        fundacion: '1908-09-21',
        matricula: 'BV-0012',
        jefe: 'Héctor Mansilla',
      },
      {
        nombre: 'San Isidro',
        region: 'Norte GBA',
        lat: -34.4711,
        lng: -58.5077,
        cumplimiento: 'risk',
        porcentajeRendicion: 42,
        fundacion: '1932-11-04',
        matricula: 'BV-0055',
        jefe: 'Luis Aramburu',
      },
      {
        nombre: 'Tigre',
        region: 'Norte GBA',
        lat: -34.4264,
        lng: -58.5797,
        cumplimiento: 'ok',
        porcentajeRendicion: 88,
        fundacion: '1915-03-10',
        matricula: 'BV-0034',
        jefe: 'Patricia Vidal',
      },
      {
        nombre: 'Vicente López',
        region: 'Norte GBA',
        lat: -34.5305,
        lng: -58.4846,
        jefe: 'Daniel Sosa',
      },
      { nombre: 'San Fernando', region: 'Norte GBA', lat: -34.4419, lng: -58.556 },
      { nombre: 'Munro', region: 'Norte GBA', lat: -34.5363, lng: -58.518 },
      { nombre: 'Florida', region: 'Norte GBA', lat: -34.5286, lng: -58.4965 },
      { nombre: 'Benavidez', region: 'Norte GBA', lat: -34.4129, lng: -58.7062 },
      { nombre: 'General Pacheco', region: 'Norte GBA', lat: -34.4525, lng: -58.6373 },
      { nombre: 'Don Torcuato', region: 'Norte GBA', lat: -34.4861, lng: -58.6266 },
      { nombre: 'Garín', region: 'Norte GBA', lat: -34.4205, lng: -58.7397 },
      { nombre: 'El Talar', region: 'Norte GBA', lat: -34.4733, lng: -58.6712 },
      {
        nombre: 'Boulogne',
        ciudad: 'Boulogne Sur Mer',
        region: 'Norte GBA',
        lat: -34.4925,
        lng: -58.5587,
      },
      { nombre: 'José León Suárez', region: 'Norte GBA', lat: -34.5391, lng: -58.5722 },
    ],
  },
  // ── REGIÓN 2 · OESTE GBA (15) ─────────────────────────────────
  {
    region: 'Oeste GBA',
    cuarteles: [
      {
        nombre: 'Morón',
        region: 'Oeste GBA',
        lat: -34.6534,
        lng: -58.6197,
        cumplimiento: 'ok',
        porcentajeRendicion: 93,
        fundacion: '1906-02-18',
        matricula: 'BV-0003',
        jefe: 'Silvia Cano',
      },
      {
        nombre: 'Tres de Febrero',
        ciudad: 'Caseros',
        region: 'Oeste GBA',
        lat: -34.6078,
        lng: -58.5617,
        cumplimiento: 'risk',
        porcentajeRendicion: 55,
        fundacion: '1938-08-20',
        matricula: 'BV-0114',
        jefe: 'Jorge Palacios',
      },
      {
        nombre: 'Ituzaingó',
        region: 'Oeste GBA',
        lat: -34.6571,
        lng: -58.6721,
        cumplimiento: 'warn',
        porcentajeRendicion: 71,
        fundacion: '1944-05-12',
        matricula: 'BV-0093',
        jefe: 'Norberto Acosta',
      },
      { nombre: 'Hurlingham', region: 'Oeste GBA', lat: -34.5887, lng: -58.6396 },
      { nombre: 'Castelar', region: 'Oeste GBA', lat: -34.6483, lng: -58.647 },
      { nombre: 'Haedo', region: 'Oeste GBA', lat: -34.6447, lng: -58.5957 },
      { nombre: 'Ramos Mejía', region: 'Oeste GBA', lat: -34.639, lng: -58.5703 },
      { nombre: 'La Tablada', region: 'Oeste GBA', lat: -34.6711, lng: -58.5246 },
      { nombre: 'González Catán', region: 'Oeste GBA', lat: -34.7726, lng: -58.6452 },
      {
        nombre: 'Laferrere',
        ciudad: 'Gregorio de Laferrere',
        region: 'Oeste GBA',
        lat: -34.7474,
        lng: -58.5901,
      },
      { nombre: 'Marcos Paz', region: 'Oeste GBA', lat: -34.78, lng: -58.8333 },
      { nombre: 'Merlo', region: 'Oeste GBA', lat: -34.6664, lng: -58.7273 },
      {
        nombre: 'Padua',
        ciudad: 'San Antonio de Padua',
        region: 'Oeste GBA',
        lat: -34.6695,
        lng: -58.706,
      },
      { nombre: 'Libertad', region: 'Oeste GBA', lat: -34.6995, lng: -58.6904 },
      { nombre: 'General Las Heras', region: 'Oeste GBA', lat: -34.929, lng: -58.9486 },
    ],
  },
  // ── REGIÓN 3 · SUR GBA (15) ────────────────────────────────────
  {
    region: 'Sur GBA',
    cuarteles: [
      {
        nombre: 'Quilmes',
        region: 'Sur GBA',
        lat: -34.7257,
        lng: -58.2595,
        cumplimiento: 'ok',
        porcentajeRendicion: 89,
        fundacion: '1910-07-28',
        matricula: 'BV-0007',
        jefe: 'Eduardo Ramos',
      },
      {
        nombre: 'Lomas de Zamora',
        region: 'Sur GBA',
        lat: -34.7605,
        lng: -58.4005,
        cumplimiento: 'warn',
        porcentajeRendicion: 74,
        fundacion: '1928-11-10',
        matricula: 'BV-0041',
        jefe: 'Graciela Fontana',
      },
      {
        nombre: 'Lanús',
        region: 'Sur GBA',
        lat: -34.7082,
        lng: -58.3872,
        cumplimiento: 'ok',
        porcentajeRendicion: 91,
        fundacion: '1919-03-05',
        matricula: 'BV-0028',
        jefe: 'Claudio Herrera',
      },
      { nombre: 'Avellaneda', region: 'Sur GBA', lat: -34.6608, lng: -58.3645 },
      { nombre: 'Berazategui', region: 'Sur GBA', lat: -34.7625, lng: -58.212 },
      { nombre: 'Florencio Varela', region: 'Sur GBA', lat: -34.8029, lng: -58.2769 },
      {
        nombre: 'Almirante Brown',
        ciudad: 'Adrogué',
        region: 'Sur GBA',
        lat: -34.8,
        lng: -58.3895,
      },
      {
        nombre: 'Esteban Echeverría',
        ciudad: 'Monte Grande',
        region: 'Sur GBA',
        lat: -34.8225,
        lng: -58.4644,
      },
      { nombre: 'Wilde', region: 'Sur GBA', lat: -34.7004, lng: -58.3137 },
      { nombre: 'Sarandí', region: 'Sur GBA', lat: -34.6739, lng: -58.3399 },
      { nombre: 'Llavallol', region: 'Sur GBA', lat: -34.7898, lng: -58.4413 },
      { nombre: 'Burzaco', region: 'Sur GBA', lat: -34.82, lng: -58.394 },
      {
        nombre: 'Ezeiza',
        ciudad: 'José María Ezeiza',
        region: 'Sur GBA',
        lat: -34.8517,
        lng: -58.5234,
      },
      { nombre: 'Glew', region: 'Sur GBA', lat: -34.8866, lng: -58.3771 },
      { nombre: 'Bernal', region: 'Sur GBA', lat: -34.7148, lng: -58.2823 },
    ],
  },
  // ── REGIÓN 4 · LA PLATA Y SUDESTE (10) ─────────────────────────
  {
    region: 'La Plata y Sudeste',
    cuarteles: [
      { nombre: 'La Plata', region: 'La Plata y Sudeste', lat: -34.9214, lng: -57.9544 },
      { nombre: 'Berisso', region: 'La Plata y Sudeste', lat: -34.8729, lng: -57.8867 },
      { nombre: 'Ensenada', region: 'La Plata y Sudeste', lat: -34.8567, lng: -57.9099 },
      { nombre: 'Magdalena', region: 'La Plata y Sudeste', lat: -35.0833, lng: -57.5167 },
      {
        nombre: 'Punta Indio',
        ciudad: 'Verónica',
        region: 'La Plata y Sudeste',
        lat: -35.3833,
        lng: -57.3167,
      },
      { nombre: 'Brandsen', region: 'La Plata y Sudeste', lat: -35.1726, lng: -58.2364 },
      { nombre: 'Cañuelas', region: 'La Plata y Sudeste', lat: -35.05, lng: -58.75 },
      { nombre: 'San Vicente', region: 'La Plata y Sudeste', lat: -35.0228, lng: -58.4214 },
      { nombre: 'Chascomús', region: 'La Plata y Sudeste', lat: -35.5786, lng: -58.0186 },
      { nombre: 'General Belgrano', region: 'La Plata y Sudeste', lat: -35.7689, lng: -58.4933 },
    ],
  },
  // ── REGIÓN 5 · COSTA ATLÁNTICA (15) ─────────────────────────────
  {
    region: 'Costa Atlántica',
    cuarteles: [
      { nombre: 'Mar del Plata', region: 'Costa Atlántica', lat: -38.0055, lng: -57.5426 },
      { nombre: 'Necochea', region: 'Costa Atlántica', lat: -38.5545, lng: -58.7396 },
      { nombre: 'Tandil', region: 'Costa Atlántica', lat: -37.3217, lng: -59.1332 },
      { nombre: 'Pinamar', region: 'Costa Atlántica', lat: -37.108, lng: -56.8615 },
      { nombre: 'Villa Gesell', region: 'Costa Atlántica', lat: -37.2548, lng: -56.975 },
      {
        nombre: 'San Bernardo',
        ciudad: 'San Bernardo del Tuyú',
        region: 'Costa Atlántica',
        lat: -36.6948,
        lng: -56.6753,
      },
      { nombre: 'Mar de Ajó', region: 'Costa Atlántica', lat: -36.7242, lng: -56.67 },
      { nombre: 'Santa Teresita', region: 'Costa Atlántica', lat: -36.5403, lng: -56.7008 },
      {
        nombre: 'San Clemente',
        ciudad: 'San Clemente del Tuyú',
        region: 'Costa Atlántica',
        lat: -36.3589,
        lng: -56.7261,
      },
      { nombre: 'General Madariaga', region: 'Costa Atlántica', lat: -37.008, lng: -57.1336 },
      { nombre: 'Balcarce', region: 'Costa Atlántica', lat: -37.8447, lng: -58.2543 },
      { nombre: 'Lobería', region: 'Costa Atlántica', lat: -38.1622, lng: -58.7836 },
      { nombre: 'Miramar', region: 'Costa Atlántica', lat: -38.2696, lng: -57.8389 },
      { nombre: 'Maipú', region: 'Costa Atlántica', lat: -36.8639, lng: -57.8742 },
      { nombre: 'Dolores', region: 'Costa Atlántica', lat: -36.3128, lng: -57.6814 },
    ],
  },
  // ── REGIÓN 6 · INTERIOR PBA NORTE (18) ──────────────────────────
  {
    region: 'Interior PBA Norte',
    cuarteles: [
      { nombre: 'Pilar', region: 'Interior PBA Norte', lat: -34.4587, lng: -58.9135 },
      {
        nombre: 'Escobar',
        ciudad: 'Belén de Escobar',
        region: 'Interior PBA Norte',
        lat: -34.3489,
        lng: -58.7903,
      },
      { nombre: 'Zárate', region: 'Interior PBA Norte', lat: -34.0975, lng: -59.0286 },
      { nombre: 'Campana', region: 'Interior PBA Norte', lat: -34.1635, lng: -58.9594 },
      { nombre: 'San Pedro', region: 'Interior PBA Norte', lat: -33.6803, lng: -59.6814 },
      { nombre: 'Baradero', region: 'Interior PBA Norte', lat: -33.8086, lng: -59.5008 },
      {
        nombre: 'San Nicolás',
        ciudad: 'San Nicolás de los Arroyos',
        region: 'Interior PBA Norte',
        lat: -33.3367,
        lng: -60.2089,
      },
      { nombre: 'Ramallo', region: 'Interior PBA Norte', lat: -33.4831, lng: -60.0036 },
      { nombre: 'Junín', region: 'Interior PBA Norte', lat: -34.5862, lng: -60.9469 },
      { nombre: 'Pergamino', region: 'Interior PBA Norte', lat: -33.8908, lng: -60.5697 },
      { nombre: 'Salto', region: 'Interior PBA Norte', lat: -34.29, lng: -60.2533 },
      { nombre: 'Rojas', region: 'Interior PBA Norte', lat: -34.205, lng: -60.7322 },
      { nombre: 'Chivilcoy', region: 'Interior PBA Norte', lat: -34.8939, lng: -60.0214 },
      { nombre: 'Mercedes', region: 'Interior PBA Norte', lat: -34.6536, lng: -59.4319 },
      { nombre: 'Luján', region: 'Interior PBA Norte', lat: -34.5703, lng: -59.1058 },
      { nombre: 'General Rodríguez', region: 'Interior PBA Norte', lat: -34.6072, lng: -58.9486 },
      { nombre: 'Chacabuco', region: 'Interior PBA Norte', lat: -34.6447, lng: -60.4744 },
      { nombre: 'Carmen de Areco', region: 'Interior PBA Norte', lat: -34.3789, lng: -59.8233 },
    ],
  },
  // ── REGIÓN 7 · INTERIOR PBA SUR (13) ─────────────────────────────
  {
    region: 'Interior PBA Sur',
    cuarteles: [
      { nombre: 'Bahía Blanca', region: 'Interior PBA Sur', lat: -38.7183, lng: -62.2664 },
      { nombre: 'Olavarría', region: 'Interior PBA Sur', lat: -36.8923, lng: -60.3225 },
      { nombre: 'Azul', region: 'Interior PBA Sur', lat: -36.7775, lng: -59.8569 },
      { nombre: 'Tres Arroyos', region: 'Interior PBA Sur', lat: -38.3784, lng: -60.2706 },
      { nombre: 'Coronel Suárez', region: 'Interior PBA Sur', lat: -37.4564, lng: -61.9286 },
      { nombre: 'Pigüé', region: 'Interior PBA Sur', lat: -37.6064, lng: -62.4153 },
      { nombre: 'Punta Alta', region: 'Interior PBA Sur', lat: -38.8845, lng: -62.0817 },
      { nombre: 'Carmen de Patagones', region: 'Interior PBA Sur', lat: -40.7986, lng: -62.9847 },
      { nombre: 'Tornquist', region: 'Interior PBA Sur', lat: -38.0997, lng: -62.2244 },
      { nombre: 'Saavedra', region: 'Interior PBA Sur', lat: -37.7567, lng: -62.3469 },
      { nombre: 'Daireaux', region: 'Interior PBA Sur', lat: -36.5961, lng: -61.7508 },
      {
        nombre: 'Bolívar',
        ciudad: 'San Carlos de Bolívar',
        region: 'Interior PBA Sur',
        lat: -36.2347,
        lng: -61.1167,
      },
      { nombre: 'Laprida', region: 'Interior PBA Sur', lat: -37.5439, lng: -60.8086 },
    ],
  },
];

/**
 * Resto de la red bonaerense: localidades reales de la Provincia de Buenos
 * Aires con bomberos voluntarios, distribuidas en las 7 regiones, para que el
 * mapa provincial muestre la red completa (~180 cuarteles). Coordenadas
 * aproximadas de cada localidad. provincia = 'Buenos Aires' por defecto en mk().
 */
const CUARTELES_EXTRA: CuartelMin[] = [
  // ── Norte GBA ──
  {
    nombre: 'Malvinas Argentinas',
    ciudad: 'Los Polvorines',
    region: 'Norte GBA',
    lat: -34.503,
    lng: -58.708,
  },
  { nombre: 'San Miguel', region: 'Norte GBA', lat: -34.543, lng: -58.712 },
  { nombre: 'Bella Vista', region: 'Norte GBA', lat: -34.573, lng: -58.685 },
  { nombre: 'Grand Bourg', region: 'Norte GBA', lat: -34.488, lng: -58.728 },
  { nombre: 'Tortuguitas', region: 'Norte GBA', lat: -34.471, lng: -58.766 },
  { nombre: 'Del Viso', region: 'Norte GBA', lat: -34.451, lng: -58.793 },
  { nombre: 'Beccar', region: 'Norte GBA', lat: -34.461, lng: -58.531 },
  { nombre: 'Martínez', region: 'Norte GBA', lat: -34.49, lng: -58.504 },
  { nombre: 'Carapachay', region: 'Norte GBA', lat: -34.518, lng: -58.539 },
  { nombre: 'Villa Adelina', region: 'Norte GBA', lat: -34.523, lng: -58.546 },
  // ── Oeste GBA ──
  { nombre: 'Moreno', region: 'Oeste GBA', lat: -34.65, lng: -58.79 },
  { nombre: 'Francisco Álvarez', region: 'Oeste GBA', lat: -34.627, lng: -58.843 },
  { nombre: 'Paso del Rey', region: 'Oeste GBA', lat: -34.661, lng: -58.762 },
  { nombre: 'El Palomar', region: 'Oeste GBA', lat: -34.611, lng: -58.591 },
  { nombre: 'Caseros', region: 'Oeste GBA', lat: -34.611, lng: -58.562 },
  { nombre: 'Isidro Casanova', region: 'Oeste GBA', lat: -34.703, lng: -58.588 },
  { nombre: 'Rafael Castillo', region: 'Oeste GBA', lat: -34.704, lng: -58.621 },
  { nombre: 'Virrey del Pino', region: 'Oeste GBA', lat: -34.783, lng: -58.654 },
  { nombre: 'Villa Tesei', region: 'Oeste GBA', lat: -34.621, lng: -58.622 },
  { nombre: 'Pontevedra', region: 'Oeste GBA', lat: -34.752, lng: -58.704 },
  // ── Sur GBA ──
  { nombre: 'Dock Sud', region: 'Sur GBA', lat: -34.66, lng: -58.339 },
  { nombre: 'Gerli', region: 'Sur GBA', lat: -34.681, lng: -58.383 },
  { nombre: 'Villa Domínico', region: 'Sur GBA', lat: -34.692, lng: -58.339 },
  { nombre: 'Banfield', region: 'Sur GBA', lat: -34.744, lng: -58.393 },
  { nombre: 'Temperley', region: 'Sur GBA', lat: -34.771, lng: -58.4 },
  { nombre: 'Adrogué', region: 'Sur GBA', lat: -34.8, lng: -58.39 },
  { nombre: 'Monte Grande', region: 'Sur GBA', lat: -34.815, lng: -58.468 },
  { nombre: 'Rafael Calzada', region: 'Sur GBA', lat: -34.789, lng: -58.352 },
  { nombre: 'Hudson', ciudad: 'Berazategui', region: 'Sur GBA', lat: -34.8, lng: -58.16 },
  { nombre: 'Claypole', region: 'Sur GBA', lat: -34.799, lng: -58.331 },
  { nombre: 'Remedios de Escalada', region: 'Sur GBA', lat: -34.722, lng: -58.402 },
  // ── La Plata y Sudeste ──
  { nombre: 'City Bell', region: 'La Plata y Sudeste', lat: -34.871, lng: -58.05 },
  { nombre: 'Villa Elisa', region: 'La Plata y Sudeste', lat: -34.857, lng: -58.08 },
  { nombre: 'Los Hornos', region: 'La Plata y Sudeste', lat: -34.95, lng: -57.97 },
  { nombre: 'Lezama', region: 'La Plata y Sudeste', lat: -35.77, lng: -57.9 },
  {
    nombre: 'General Paz',
    ciudad: 'Ranchos',
    region: 'La Plata y Sudeste',
    lat: -35.512,
    lng: -58.312,
  },
  { nombre: 'Castelli', region: 'La Plata y Sudeste', lat: -36.092, lng: -57.802 },
  { nombre: 'Pila', region: 'La Plata y Sudeste', lat: -36.01, lng: -58.15 },
  { nombre: 'Verónica', region: 'La Plata y Sudeste', lat: -35.388, lng: -57.337 },
  { nombre: 'Bartolomé Bavio', region: 'La Plata y Sudeste', lat: -35.2, lng: -57.78 },
  // ── Costa Atlántica ──
  { nombre: 'Sierra de los Padres', region: 'Costa Atlántica', lat: -37.95, lng: -57.77 },
  { nombre: 'Santa Clara del Mar', region: 'Costa Atlántica', lat: -37.833, lng: -57.512 },
  { nombre: 'Mar del Tuyú', region: 'Costa Atlántica', lat: -36.551, lng: -56.69 },
  { nombre: 'Las Toninas', region: 'Costa Atlántica', lat: -36.512, lng: -56.7 },
  { nombre: 'General Pirán', region: 'Costa Atlántica', lat: -37.3, lng: -57.78 },
  { nombre: 'Ayacucho', region: 'Costa Atlántica', lat: -37.15, lng: -58.483 },
  { nombre: 'Rauch', region: 'Costa Atlántica', lat: -36.77, lng: -59.09 },
  { nombre: 'Coronel Vidal', region: 'Costa Atlántica', lat: -37.45, lng: -57.73 },
  { nombre: 'General Lavalle', region: 'Costa Atlántica', lat: -36.404, lng: -56.954 },
  { nombre: 'Mar Chiquita', region: 'Costa Atlántica', lat: -37.74, lng: -57.43 },
  {
    nombre: 'Otamendi',
    ciudad: 'Comandante Nicanor Otamendi',
    region: 'Costa Atlántica',
    lat: -38.13,
    lng: -57.85,
  },
  { nombre: 'Orense', region: 'Costa Atlántica', lat: -38.7, lng: -59.78 },
  // ── Interior PBA Norte ──
  { nombre: 'Arrecifes', region: 'Interior PBA Norte', lat: -34.063, lng: -60.105 },
  { nombre: 'Capitán Sarmiento', region: 'Interior PBA Norte', lat: -34.17, lng: -59.79 },
  { nombre: 'San Andrés de Giles', region: 'Interior PBA Norte', lat: -34.445, lng: -59.444 },
  { nombre: 'Suipacha', region: 'Interior PBA Norte', lat: -34.77, lng: -59.69 },
  { nombre: 'Lincoln', region: 'Interior PBA Norte', lat: -34.866, lng: -61.531 },
  { nombre: 'General Pinto', region: 'Interior PBA Norte', lat: -34.762, lng: -61.89 },
  { nombre: 'Colón', region: 'Interior PBA Norte', lat: -33.89, lng: -61.1 },
  { nombre: 'Bragado', region: 'Interior PBA Norte', lat: -35.12, lng: -60.49 },
  { nombre: 'Alberti', region: 'Interior PBA Norte', lat: -35.03, lng: -60.281 },
  { nombre: 'Lobos', region: 'Interior PBA Norte', lat: -35.183, lng: -59.097 },
  { nombre: '9 de Julio', region: 'Interior PBA Norte', lat: -35.444, lng: -60.883 },
  { nombre: 'Veinticinco de Mayo', region: 'Interior PBA Norte', lat: -35.432, lng: -60.172 },
  { nombre: 'Carlos Tejedor', region: 'Interior PBA Norte', lat: -35.388, lng: -62.423 },
  // ── Interior PBA Sur ──
  { nombre: 'Coronel Dorrego', region: 'Interior PBA Sur', lat: -38.72, lng: -61.29 },
  { nombre: 'Coronel Pringles', region: 'Interior PBA Sur', lat: -37.98, lng: -61.352 },
  { nombre: 'Benito Juárez', region: 'Interior PBA Sur', lat: -37.672, lng: -59.803 },
  { nombre: 'Pehuajó', region: 'Interior PBA Sur', lat: -35.812, lng: -61.9 },
  { nombre: 'Carlos Casares', region: 'Interior PBA Sur', lat: -35.622, lng: -61.362 },
  { nombre: 'Trenque Lauquen', region: 'Interior PBA Sur', lat: -35.973, lng: -62.733 },
  { nombre: 'General Villegas', region: 'Interior PBA Sur', lat: -35.03, lng: -63.012 },
  { nombre: 'Monte Hermoso', region: 'Interior PBA Sur', lat: -38.983, lng: -61.3 },
  {
    nombre: 'Carhué',
    ciudad: 'Adolfo Alsina',
    region: 'Interior PBA Sur',
    lat: -37.178,
    lng: -62.759,
  },
  { nombre: 'General Lamadrid', region: 'Interior PBA Sur', lat: -37.25, lng: -61.23 },
  { nombre: 'Guaminí', region: 'Interior PBA Sur', lat: -37.011, lng: -62.417 },
  { nombre: 'Salliqueló', region: 'Interior PBA Sur', lat: -36.752, lng: -62.95 },
  { nombre: 'Adolfo Gonzales Chaves', region: 'Interior PBA Sur', lat: -38.03, lng: -60.097 },
  { nombre: 'Tres Lomas', region: 'Interior PBA Sur', lat: -36.453, lng: -62.863 },
];

let _idx = 0;
let _mat = 100;
export const cuartelesMock: Cuartel[] = [
  ...REGIONES_DATOS.flatMap((reg) => reg.cuarteles),
  ...CUARTELES_EXTRA,
].map((c) => {
  _idx++;
  _mat++;
  return mk(c, _idx, _mat);
});

export const CUARTEL_PRINCIPAL_ID = 'cuartel-villa-ballester';

export const REGIONES_FEDERACION = [
  'Norte GBA',
  'Oeste GBA',
  'Sur GBA',
  'La Plata y Sudeste',
  'Costa Atlántica',
  'Interior PBA Norte',
  'Interior PBA Sur',
] as const;

export type RegionFederacion = (typeof REGIONES_FEDERACION)[number];
