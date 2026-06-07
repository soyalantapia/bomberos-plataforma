/**
 * Biblioteca de protocolos operativos del cuartel — para el cuerpo activo, en el
 * celular y disponible offline (PWA). Contenido ilustrativo basado en prácticas
 * estándar de bomberos voluntarios; cada cuartel adapta los suyos.
 */

export type CategoriaProtocolo =
  | 'incendio_estructural'
  | 'incendio_forestal'
  | 'rescate_vehicular'
  | 'materiales_peligrosos'
  | 'rescate_altura'
  | 'emergencia_medica'
  | 'autoproteccion';

export interface Protocolo {
  id: string;
  titulo: string;
  categoria: CategoriaProtocolo;
  /** Cuándo se aplica — una línea. */
  resumen: string;
  /** Procedimiento paso a paso. */
  pasos: string[];
  /** Puntos críticos de seguridad. */
  seguridad: string[];
  /** Equipo necesario. */
  equipo: string[];
  actualizado: string;
}

export const CATEGORIA_PROTOCOLO_LABEL: Record<CategoriaProtocolo, string> = {
  incendio_estructural: 'Incendio estructural',
  incendio_forestal: 'Incendio forestal',
  rescate_vehicular: 'Rescate vehicular',
  materiales_peligrosos: 'Materiales peligrosos',
  rescate_altura: 'Rescate y altura',
  emergencia_medica: 'Emergencia médica',
  autoproteccion: 'Autoprotección',
};

export const protocolosMock: Protocolo[] = [
  {
    id: 'prot-estructural',
    titulo: 'Ataque a incendio estructural',
    categoria: 'incendio_estructural',
    resumen: 'Fuego declarado en vivienda o edificio con posible presencia de personas.',
    pasos: [
      'Evaluá la escena en el arribo: tipo de estructura, accesos, cableado, presencia de víctimas y hacia dónde va el humo.',
      'Establecé el mando (ICS) e informá por radio situación, recursos y plan de acción.',
      'Asegurá abastecimiento de agua antes de ingresar (hidrante, tanque, autobomba).',
      'Tendé la línea de ataque y SIEMPRE una línea de respaldo antes de entrar.',
      'Coordiná la ventilación con el ataque: ventilar mal alimenta el fuego.',
      'Búsqueda y rescate primaria en binomio, manteniendo contacto con la pared.',
      'Atacá el foco; luego remoción y enfriamiento para evitar reignición.',
      'Revisión final, causa probable y entrega de la escena.',
    ],
    seguridad: [
      'Nunca ingresar solo: siempre en binomio y con línea de vida.',
      'ERA puesto y operativo desde antes de entrar.',
      'Vigilá señales de flashover y backdraft (humo denso bajo presión, vidrios calientes).',
      'Control de aire: regla de los tercios para la salida.',
    ],
    equipo: [
      'EPP estructural completo',
      'ERA',
      'Línea 45 mm',
      'Herramienta de forzado',
      'Cámara térmica',
      'Radio',
    ],
    actualizado: '2026-04-18',
  },
  {
    id: 'prot-forestal',
    titulo: 'Incendio forestal y de pastizal',
    categoria: 'incendio_forestal',
    resumen: 'Fuego en campo, pastizal o interfase con viento y vegetación seca.',
    pasos: [
      'Leé el comportamiento del fuego: viento, pendiente y tipo de combustible.',
      'Definí cabeza, flancos y cola; nunca atacar de frente la cabeza.',
      'Establecé líneas de defensa aprovechando caminos, cursos de agua y cortafuegos.',
      'Atacá por los flancos avanzando hacia la cabeza (ataque en pinza).',
      'Mantené siempre una vía de escape y una zona de seguridad identificadas.',
      'Liquidá y enfriá el perímetro; controlá pavesas y reignición.',
    ],
    seguridad: [
      'Reglas LCES: vigía (Lookout), comunicación, vías de escape y zona de seguridad.',
      'Nunca quedar cuesta arriba del fuego ni encajonado por el viento.',
      'Hidratación constante: el golpe de calor es la principal baja.',
      'Si te alcanza el fuego: refugio en zona quemada o despliegue de protección.',
    ],
    equipo: [
      'EPP forestal',
      'Batefuego / pala',
      'Mochila de agua',
      'Antiparras y barbijo',
      'Agua para hidratación',
      'GPS o app de ubicación',
    ],
    actualizado: '2026-03-30',
  },
  {
    id: 'prot-vehicular',
    titulo: 'Rescate vehicular (excarcelación)',
    categoria: 'rescate_vehicular',
    resumen: 'Accidente de tránsito con persona atrapada en el vehículo.',
    pasos: [
      'Asegurá la escena: corte de tránsito, calzas en las ruedas, freno de mano.',
      'Neutralizá riesgos: cortá la batería (negativo primero) y atención a airbags sin disparar.',
      'Estabilizá el vehículo con calzas y tacos antes de tocar al paciente.',
      'Accedé al paciente; un rescatista hace contacto y control cervical.',
      'Creá espacio: retirá puertas/techo según la técnica que menos mueva al paciente.',
      'Extracción coordinada sobre tabla, manteniendo el eje cabeza-cuello-tronco.',
      'Entrega al SEM (servicio de emergencias médicas).',
    ],
    seguridad: [
      'Atención a airbags y pretensores no disparados: zonas de exclusión.',
      'Vehículos eléctricos/híbridos: riesgo de alta tensión, identificá el corte.',
      'Nunca apurar la extracción salvo riesgo de fuego o paro: trabajá el plan A y el plan B (rápido).',
      'EPP completo: el cristal y el metal cortan.',
    ],
    equipo: [
      'Herramienta hidráulica (cizalla/separador)',
      'Calzas y tacos',
      'Tabla espinal y collar',
      'Protección para el paciente',
      'Extintor de respaldo',
      'EPP completo',
    ],
    actualizado: '2026-04-02',
  },
  {
    id: 'prot-hazmat',
    titulo: 'Derrame de materiales peligrosos',
    categoria: 'materiales_peligrosos',
    resumen: 'Fuga o derrame de sustancia peligrosa (transporte, industria o domicilio).',
    pasos: [
      'Acercate por viento a favor y desde lo alto; detené el avance a distancia segura.',
      'Identificá la sustancia: rombo NFPA, número ONU, panel naranja, guía DOT/GRE.',
      'Establecé zonas: caliente (exclusión), tibia (descontaminación) y fría (apoyo).',
      'Aislá y negá el acceso; evacuá según la distancia recomendada por la guía.',
      'Controlá la fuente solo si está dentro de tu nivel de capacitación y EPP.',
      'Contené el derrame (diques, absorbentes) evitando sumideros y cursos de agua.',
      'Descontaminación del personal antes de salir de la zona tibia.',
    ],
    seguridad: [
      'No seas víctima: si no estás capacitado/equipado para ese nivel, aislá y pedí apoyo especializado.',
      'Nunca tocar, oler ni caminar sobre el producto derramado.',
      'Consultá SIEMPRE la Guía de Respuesta a Emergencias por el número ONU.',
      'Atención a atmósferas explosivas: sin fuentes de ignición.',
    ],
    equipo: [
      'Guía de Respuesta a Emergencias (GRE)',
      'EPP según nivel',
      'Detector de gases',
      'Material absorbente / dique',
      'Cinta de demarcación',
      'Binoculares',
    ],
    actualizado: '2026-02-20',
  },
  {
    id: 'prot-altura',
    titulo: 'Rescate en altura y espacios confinados',
    categoria: 'rescate_altura',
    resumen: 'Persona en altura, en pozo, silo o espacio confinado con acceso restringido.',
    pasos: [
      'Evaluá riesgos del espacio: atmósfera, estructura, posibilidad de colapso.',
      'En espacio confinado: medí la atmósfera (oxígeno, explosividad, tóxicos) antes de entrar.',
      'Montá el sistema de anclaje: doble punto, redundante y certificado.',
      'Designá rescatista, asegurador y supervisor; nadie entra sin respaldo.',
      'Descenso/ascenso controlado con frenos y línea de seguridad independiente.',
      'Inmovilizá y asegurá a la víctima a la camilla antes de moverla.',
      'Izaje o descenso coordinado hasta zona segura.',
    ],
    seguridad: [
      'Espacio confinado = atmósfera peligrosa hasta que el medidor diga lo contrario.',
      'Ventilación forzada y monitoreo continuo durante toda la operación.',
      'Doble línea: una de trabajo y una de seguridad, en anclajes distintos.',
      'Supervisor fuera, con plan de rescate del rescatista.',
    ],
    equipo: [
      'Arnés y cuerdas certificadas',
      'Frenos y poleas',
      'Trípode / anclajes',
      'Detector de gases',
      'Ventilador',
      'Camilla de rescate',
    ],
    actualizado: '2026-03-12',
  },
  {
    id: 'prot-rcp',
    titulo: 'RCP — paro cardiorrespiratorio',
    categoria: 'emergencia_medica',
    resumen: 'Persona inconsciente que no respira o no respira normalmente.',
    pasos: [
      'Verificá la seguridad de la escena y usá guantes.',
      'Comprobá respuesta y respiración (ver, oír, sentir ≤ 10 segundos).',
      'Pedí ayuda y el DEA; activá el SEM (llamá o que alguien llame).',
      'Iniciá compresiones: centro del pecho, 100-120 por minuto, 5-6 cm de profundidad.',
      'Permití el retroceso completo del tórax entre compresiones.',
      '30 compresiones : 2 ventilaciones si estás capacitado; si no, solo compresiones.',
      'Apenas llega el DEA, encendelo y seguí las indicaciones de voz.',
      'No interrumpas más de 10 segundos; rotá rescatistas cada 2 minutos.',
    ],
    seguridad: [
      'Minimizá interrupciones: la compresión continua salva.',
      'Superficie firme; no compresiones sobre colchón blando.',
      'Seguridad del rescatista: guantes y barrera para ventilar.',
      'No retires el DEA hasta que llegue el SEM.',
    ],
    equipo: [
      'DEA',
      'Guantes',
      'Barbijo / barrera de ventilación',
      'Tijera trauma',
      'Bolsa-válvula-máscara (si hay)',
    ],
    actualizado: '2026-04-25',
  },
  {
    id: 'prot-triage',
    titulo: 'Accidente con múltiples víctimas (triage START)',
    categoria: 'emergencia_medica',
    resumen: 'Incidente donde la cantidad de víctimas supera los recursos iniciales.',
    pasos: [
      'Asumí el mando y pedí refuerzos: declará incidente de múltiples víctimas.',
      'Pedí a los que puedan caminar que se muevan a un punto: esos son VERDES (leves).',
      'Evaluá al resto con START: respiración, perfusión y estado mental.',
      'No respira tras abrir vía aérea → NEGRO. Respira > 30/min → ROJO.',
      'Relleno capilar > 2 s o pulso radial ausente → ROJO.',
      'No obedece órdenes simples → ROJO; obedece → AMARILLO.',
      'Marcá a cada víctima con su color y seguí; no te detengas a tratar (solo abrir vía aérea o comprimir hemorragia masiva).',
      'Reevaluá y derivá por prioridad cuando lleguen los recursos.',
    ],
    seguridad: [
      'En triage primario solo dos gestos: abrir vía aérea y frenar hemorragia exanguinante.',
      'No te "enganches" con un paciente: el objetivo es clasificar a todos rápido.',
      'Reevaluación continua: los pacientes cambian de categoría.',
      'EPP y bioseguridad ante sangre y fluidos.',
    ],
    equipo: [
      'Tarjetas / cintas de triage',
      'Guantes',
      'Torniquetes',
      'Apósitos compresivos',
      'Planilla de víctimas',
    ],
    actualizado: '2026-03-08',
  },
  {
    id: 'prot-mayday',
    titulo: 'Autoprotección y Mayday del bombero',
    categoria: 'autoproteccion',
    resumen: 'Un bombero queda atrapado, perdido, sin aire o herido durante la intervención.',
    pasos: [
      'Declará MAYDAY por radio: identificación, ubicación, situación y aire restante (LUNAR).',
      'Activá el PASS/ADSU (alarma personal) para que te localicen por sonido.',
      'Controlá el consumo de aire: respiración lenta, no entres en pánico.',
      'Buscá una pared y seguila hacia una salida o ventana.',
      'Hacé señales: linterna, golpes, voz hacia donde escuches actividad.',
      'Si no podés salir, protegé la vía aérea y posicionate para ser hallado (cerca de aberturas).',
      'El mando lanza el equipo de intervención rápida (RIT) hacia tu última posición conocida.',
    ],
    seguridad: [
      'MAYDAY temprano: pedir ayuda no es debilidad, esperar mata.',
      'Regla de los tercios: un tercio para entrar, uno para trabajar, uno para salir.',
      'Nunca te separes del binomio ni de la línea de manguera.',
      'Conocé tu consumo de aire y los puntos de salida desde que entrás.',
    ],
    equipo: ['ERA con PASS/ADSU', 'Radio', 'Linterna', 'Línea de vida', 'Herramienta personal'],
    actualizado: '2026-04-20',
  },
];
