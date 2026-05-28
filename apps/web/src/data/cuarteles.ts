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
  // ── Córdoba ──────────────────────────────────────────────
  'villa-carlos-paz': '/cuarteles/villa-carlos-paz.png',
  'san-francisco': '/cuarteles/san-francisco.png',
  // ── Santa Fe ─────────────────────────────────────────────
  'santa-fe-capital': '/cuarteles/santa-fe-capital.png',
  rosario: '/cuarteles/rosario.png',
  // ── Litoral ──────────────────────────────────────────────
  posadas: '/cuarteles/posadas.png',
  // ── Patagonia ────────────────────────────────────────────
  ushuaia: '/cuarteles/ushuaia.png',
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
  // ── REGIÓN 8 · CÓRDOBA (22) ─────────────────────────────────────
  {
    region: 'Córdoba',
    cuarteles: [
      {
        nombre: 'Córdoba Capital',
        ciudad: 'Córdoba',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.4201,
        lng: -64.1888,
      },
      {
        nombre: 'Villa Carlos Paz',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.4245,
        lng: -64.4978,
      },
      {
        nombre: 'Río Cuarto',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -33.1233,
        lng: -64.3492,
      },
      {
        nombre: 'San Francisco',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.4253,
        lng: -62.0828,
      },
      {
        nombre: 'Villa María',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -32.4081,
        lng: -63.24,
      },
      {
        nombre: 'Marcos Juárez',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -32.7008,
        lng: -62.1031,
      },
      {
        nombre: 'Bell Ville',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -32.6253,
        lng: -62.6878,
      },
      {
        nombre: 'Río Tercero',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -32.1797,
        lng: -64.11,
      },
      {
        nombre: 'Río Ceballos',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.1654,
        lng: -64.33,
      },
      {
        nombre: 'Alta Gracia',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.6531,
        lng: -64.4283,
      },
      { nombre: 'La Falda', region: 'Córdoba', provincia: 'Córdoba', lat: -31.0911, lng: -64.4961 },
      {
        nombre: 'Mina Clavero',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.7261,
        lng: -65.0075,
      },
      { nombre: 'Cosquín', region: 'Córdoba', provincia: 'Córdoba', lat: -31.2425, lng: -64.4664 },
      {
        nombre: 'Capilla del Monte',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -30.8597,
        lng: -64.5247,
      },
      {
        nombre: 'Jesús María',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -30.9831,
        lng: -64.095,
      },
      {
        nombre: 'Villa Allende',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.2911,
        lng: -64.2942,
      },
      {
        nombre: 'Villa Dolores',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.9469,
        lng: -65.1881,
      },
      {
        nombre: 'Las Varillas',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.8722,
        lng: -62.7203,
      },
      { nombre: 'Oncativo', region: 'Córdoba', provincia: 'Córdoba', lat: -31.9106, lng: -63.6797 },
      { nombre: 'Arroyito', region: 'Córdoba', provincia: 'Córdoba', lat: -31.415, lng: -63.0539 },
      { nombre: 'La Cumbre', region: 'Córdoba', provincia: 'Córdoba', lat: -30.975, lng: -64.4928 },
      {
        nombre: 'Río Segundo',
        region: 'Córdoba',
        provincia: 'Córdoba',
        lat: -31.6481,
        lng: -63.8983,
      },
    ],
  },
  // ── REGIÓN 9 · SANTA FE (13) ─────────────────────────────────────
  {
    region: 'Santa Fe',
    cuarteles: [
      {
        nombre: 'Santa Fe Capital',
        ciudad: 'Santa Fe',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -31.6333,
        lng: -60.7,
      },
      {
        nombre: 'Rosario',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -32.9442,
        lng: -60.6505,
      },
      {
        nombre: 'Venado Tuerto',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -33.7456,
        lng: -61.9683,
      },
      {
        nombre: 'Reconquista',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -29.1547,
        lng: -59.6517,
      },
      {
        nombre: 'Cañada de Gómez',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -32.8186,
        lng: -61.3925,
      },
      {
        nombre: 'Casilda',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -33.0436,
        lng: -61.1689,
      },
      {
        nombre: 'Esperanza',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -31.4486,
        lng: -60.9325,
      },
      {
        nombre: 'Rafaela',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -31.2528,
        lng: -61.4867,
      },
      {
        nombre: 'Sunchales',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -30.9461,
        lng: -61.5614,
      },
      {
        nombre: 'San Justo',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -30.7864,
        lng: -60.5897,
      },
      {
        nombre: 'San Cristóbal',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -30.3142,
        lng: -61.2347,
      },
      { nombre: 'Rufino', region: 'Santa Fe', provincia: 'Santa Fe', lat: -34.2683, lng: -62.7117 },
      {
        nombre: 'San Lorenzo',
        region: 'Santa Fe',
        provincia: 'Santa Fe',
        lat: -32.7456,
        lng: -60.7372,
      },
    ],
  },
  // ── REGIÓN 10 · LITORAL (13) ─────────────────────────────────────
  {
    region: 'Litoral',
    cuarteles: [
      {
        nombre: 'Paraná',
        region: 'Litoral',
        provincia: 'Entre Ríos',
        lat: -31.7444,
        lng: -60.5183,
      },
      {
        nombre: 'Concordia',
        region: 'Litoral',
        provincia: 'Entre Ríos',
        lat: -31.3933,
        lng: -58.0208,
      },
      {
        nombre: 'Gualeguaychú',
        region: 'Litoral',
        provincia: 'Entre Ríos',
        lat: -33.0094,
        lng: -58.5172,
      },
      {
        nombre: 'Concepción del Uruguay',
        region: 'Litoral',
        provincia: 'Entre Ríos',
        lat: -32.4842,
        lng: -58.2353,
      },
      {
        nombre: 'Victoria',
        region: 'Litoral',
        provincia: 'Entre Ríos',
        lat: -32.6172,
        lng: -60.1567,
      },
      {
        nombre: 'Corrientes Capital',
        ciudad: 'Corrientes',
        region: 'Litoral',
        provincia: 'Corrientes',
        lat: -27.4806,
        lng: -58.8342,
      },
      { nombre: 'Goya', region: 'Litoral', provincia: 'Corrientes', lat: -29.1397, lng: -59.2614 },
      {
        nombre: 'Mercedes Corrientes',
        ciudad: 'Mercedes',
        region: 'Litoral',
        provincia: 'Corrientes',
        lat: -29.1856,
        lng: -58.0728,
      },
      { nombre: 'Posadas', region: 'Litoral', provincia: 'Misiones', lat: -27.3667, lng: -55.8961 },
      {
        nombre: 'Eldorado',
        region: 'Litoral',
        provincia: 'Misiones',
        lat: -26.4006,
        lng: -54.6322,
      },
      {
        nombre: 'Puerto Iguazú',
        region: 'Litoral',
        provincia: 'Misiones',
        lat: -25.5972,
        lng: -54.5786,
      },
      {
        nombre: 'Resistencia',
        region: 'Litoral',
        provincia: 'Chaco',
        lat: -27.4514,
        lng: -58.9867,
      },
      {
        nombre: 'Formosa Capital',
        ciudad: 'Formosa',
        region: 'Litoral',
        provincia: 'Formosa',
        lat: -26.185,
        lng: -58.175,
      },
    ],
  },
  // ── REGIÓN 11 · CUYO (10) ─────────────────────────────────────────
  {
    region: 'Cuyo',
    cuarteles: [
      {
        nombre: 'Mendoza Capital',
        ciudad: 'Mendoza',
        region: 'Cuyo',
        provincia: 'Mendoza',
        lat: -32.8908,
        lng: -68.8272,
      },
      { nombre: 'San Rafael', region: 'Cuyo', provincia: 'Mendoza', lat: -34.6175, lng: -68.33 },
      { nombre: 'Malargüe', region: 'Cuyo', provincia: 'Mendoza', lat: -35.4742, lng: -69.5847 },
      { nombre: 'Tunuyán', region: 'Cuyo', provincia: 'Mendoza', lat: -33.5833, lng: -69.0167 },
      {
        nombre: 'San Martín Mendoza',
        ciudad: 'San Martín',
        region: 'Cuyo',
        provincia: 'Mendoza',
        lat: -33.0828,
        lng: -68.4661,
      },
      {
        nombre: 'Maipú Mendoza',
        ciudad: 'Maipú',
        region: 'Cuyo',
        provincia: 'Mendoza',
        lat: -32.9747,
        lng: -68.7858,
      },
      {
        nombre: 'San Juan Capital',
        ciudad: 'San Juan',
        region: 'Cuyo',
        provincia: 'San Juan',
        lat: -31.5375,
        lng: -68.5364,
      },
      { nombre: 'Caucete', region: 'Cuyo', provincia: 'San Juan', lat: -31.65, lng: -68.2833 },
      {
        nombre: 'San Luis Capital',
        ciudad: 'San Luis',
        region: 'Cuyo',
        provincia: 'San Luis',
        lat: -33.295,
        lng: -66.3356,
      },
      {
        nombre: 'Villa Mercedes',
        region: 'Cuyo',
        provincia: 'San Luis',
        lat: -33.6753,
        lng: -65.4592,
      },
    ],
  },
  // ── REGIÓN 12 · NOA (9) ───────────────────────────────────────────
  {
    region: 'NOA',
    cuarteles: [
      {
        nombre: 'Tucumán',
        ciudad: 'San Miguel de Tucumán',
        region: 'NOA',
        provincia: 'Tucumán',
        lat: -26.8083,
        lng: -65.2176,
      },
      { nombre: 'Tafí Viejo', region: 'NOA', provincia: 'Tucumán', lat: -26.7367, lng: -65.2589 },
      {
        nombre: 'Salta Capital',
        ciudad: 'Salta',
        region: 'NOA',
        provincia: 'Salta',
        lat: -24.7821,
        lng: -65.4232,
      },
      { nombre: 'Tartagal', region: 'NOA', provincia: 'Salta', lat: -22.5167, lng: -63.8 },
      {
        nombre: 'San Salvador de Jujuy',
        region: 'NOA',
        provincia: 'Jujuy',
        lat: -24.1858,
        lng: -65.2995,
      },
      {
        nombre: 'Catamarca Capital',
        ciudad: 'San Fernando del Valle de Catamarca',
        region: 'NOA',
        provincia: 'Catamarca',
        lat: -28.4696,
        lng: -65.7795,
      },
      {
        nombre: 'La Rioja Capital',
        ciudad: 'La Rioja',
        region: 'NOA',
        provincia: 'La Rioja',
        lat: -29.4133,
        lng: -66.8558,
      },
      {
        nombre: 'Santiago del Estero',
        region: 'NOA',
        provincia: 'Santiago del Estero',
        lat: -27.795,
        lng: -64.2615,
      },
      {
        nombre: 'La Banda',
        region: 'NOA',
        provincia: 'Santiago del Estero',
        lat: -27.7339,
        lng: -64.2417,
      },
    ],
  },
  // ── REGIÓN 13 · PATAGONIA (12) ────────────────────────────────────
  {
    region: 'Patagonia',
    cuarteles: [
      {
        nombre: 'Neuquén Capital',
        ciudad: 'Neuquén',
        region: 'Patagonia',
        provincia: 'Neuquén',
        lat: -38.9516,
        lng: -68.0591,
      },
      {
        nombre: 'San Martín de los Andes',
        region: 'Patagonia',
        provincia: 'Neuquén',
        lat: -40.1574,
        lng: -71.3534,
      },
      {
        nombre: 'Villa La Angostura',
        region: 'Patagonia',
        provincia: 'Neuquén',
        lat: -40.761,
        lng: -71.6489,
      },
      { nombre: 'Zapala', region: 'Patagonia', provincia: 'Neuquén', lat: -38.8964, lng: -70.0631 },
      {
        nombre: 'Bariloche',
        ciudad: 'San Carlos de Bariloche',
        region: 'Patagonia',
        provincia: 'Río Negro',
        lat: -41.1335,
        lng: -71.3103,
      },
      {
        nombre: 'Cipolletti',
        region: 'Patagonia',
        provincia: 'Río Negro',
        lat: -38.9333,
        lng: -67.9833,
      },
      {
        nombre: 'General Roca',
        region: 'Patagonia',
        provincia: 'Río Negro',
        lat: -39.0333,
        lng: -67.5833,
      },
      { nombre: 'Viedma', region: 'Patagonia', provincia: 'Río Negro', lat: -40.8, lng: -63.0 },
      {
        nombre: 'Comodoro Rivadavia',
        region: 'Patagonia',
        provincia: 'Chubut',
        lat: -45.8667,
        lng: -67.5,
      },
      { nombre: 'Trelew', region: 'Patagonia', provincia: 'Chubut', lat: -43.2489, lng: -65.305 },
      { nombre: 'Esquel', region: 'Patagonia', provincia: 'Chubut', lat: -42.9111, lng: -71.3194 },
      {
        nombre: 'Ushuaia',
        region: 'Patagonia',
        provincia: 'Tierra del Fuego',
        lat: -54.8019,
        lng: -68.303,
      },
    ],
  },
];

let _idx = 0;
let _mat = 100;
export const cuartelesMock: Cuartel[] = REGIONES_DATOS.flatMap((reg) =>
  reg.cuarteles.map((c) => {
    _idx++;
    _mat++;
    return mk(c, _idx, _mat);
  }),
);

export const CUARTEL_PRINCIPAL_ID = 'cuartel-villa-ballester';

export const REGIONES_FEDERACION = [
  'Norte GBA',
  'Oeste GBA',
  'Sur GBA',
  'La Plata y Sudeste',
  'Costa Atlántica',
  'Interior PBA Norte',
  'Interior PBA Sur',
  'Córdoba',
  'Santa Fe',
  'Litoral',
  'Cuyo',
  'NOA',
  'Patagonia',
] as const;

export type RegionFederacion = (typeof REGIONES_FEDERACION)[number];
