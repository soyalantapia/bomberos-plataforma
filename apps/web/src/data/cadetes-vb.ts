import type { Persona } from '@faro/types';

/**
 * Cuerpo de Cadetes de BV Villa Ballester (aspirantes, 15-17 años).
 * El padrón oficial importado no traía cadetes; se suman acá para reflejar
 * el cuadro de revista completo del cuartel. jerarquia: 'cadete'.
 */
function cadete(
  n: number,
  nombre: string,
  apellido: string,
  sexo: 'Masculino' | 'Femenino',
  nac: string,
): Persona {
  const num = String(n).padStart(2, '0');
  return {
    id: `vb-cad-${num}`,
    cuartelId: 'cuartel-villa-ballester',
    legajo: `107/C${num}`,
    nombre,
    apellido,
    email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@bvvballester.org.ar`,
    telefono: '+54 11 15' + (40000000 + n * 137).toString().slice(0, 8),
    fechaNacimiento: nac,
    fechaIngreso: '2025-03-01',
    jerarquia: 'cadete',
    estado: 'activo',
    base: 'Cuartel Central',
    funcion: 'Cadete',
    perfiles: ['bombero'],
    cuerpo: 'activo',
    sexo,
    salud: { grupoSanguineo: '0+' },
    cursos: [],
    legajoExtra: {
      sexo,
      jerarquiaReal: 'Cadete',
      cargoInstitucion: 'Cadete',
      escalafon: 'Cuerpo Cadetes',
      provincia: 'Buenos Aires',
      provinciaNacimiento: 'Buenos Aires',
      region: 'Norte GBA',
    },
  };
}

export const cadetesVillaBallester: Persona[] = [
  cadete(1, 'Lautaro', 'Giménez', 'Masculino', '2009-04-12'),
  cadete(2, 'Morena', 'Acosta', 'Femenino', '2009-08-23'),
  cadete(3, 'Thiago', 'Ferreyra', 'Masculino', '2008-11-05'),
  cadete(4, 'Zoe', 'Romero', 'Femenino', '2010-01-18'),
  cadete(5, 'Benjamín', 'Sosa', 'Masculino', '2008-06-30'),
  cadete(6, 'Catalina', 'Ríos', 'Femenino', '2009-12-09'),
  cadete(7, 'Bautista', 'Núñez', 'Masculino', '2010-03-21'),
  cadete(8, 'Valentino', 'Cabrera', 'Masculino', '2009-07-14'),
];
