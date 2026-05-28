import type { EspecialidadBombero, LegajoExtra, Persona } from '@faro/types';

import { cuartelesMock } from './cuarteles';
import { padronFuente } from './padron-fuente';

// ─────────────────────────────────────────────────────────────────
// FUENTE: 93 bomberos reales de Villa Ballester (Cuartel 107)
// Datos extraídos de backup oficial de secciones (abril 2025).
// Se usan como nombres/cargos reales para poblar todos los cuarteles
// de la federación con apariencia auténtica.
// ─────────────────────────────────────────────────────────────────

type BomberoFuente = {
  apellido: string;
  nombre: string;
  jerarquiaReal: string;
  funcion: string;
  email: string;
  jerarquia: Persona['jerarquia'];
  cuerpo: 'activo' | 'administrativo';
};

const FUENTE: BomberoFuente[] = [
  {
    apellido: 'Romero',
    nombre: 'Enrique Aníbal',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Ayudante Principal',
    email: 'enriqueanibalromero@gmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Machado',
    nombre: 'Miguel',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Jefe Escuela Cadetes',
    email: 'miguel.machado174@gmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'De Barbieri',
    nombre: 'Néstor Camilo',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Intendencia',
    email: 'nestorcamilodebarbieri@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Riger',
    nombre: 'Jorge Luis',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Ayudantía',
    email: 'jorge.riger.1970@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ciarlo Ufer',
    nombre: 'Alejandro',
    jerarquiaReal: 'SubComandante',
    funcion: 'Sub Comandante · Jefatura',
    email: 'aleciarlo214@gmail.com',
    jerarquia: 'sub_comandante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Segura',
    nombre: 'Marcelo Ángel',
    jerarquiaReal: 'Oficial Auxiliar',
    funcion: 'Encargado Capacitación Externa',
    email: 'bomberos221@hotmail.com',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Cabrera',
    nombre: 'Anselmo',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Hidráulica',
    email: 'danielcabrera234107@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Astorga',
    nombre: 'Javier Aníbal',
    jerarquiaReal: 'Comandante Mayor',
    funcion: 'Jefe Sección Ayudantía',
    email: 'javier_astorga0243@hotmail.com',
    jerarquia: 'comandante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Castro',
    nombre: 'Horacio Martín',
    jerarquiaReal: 'Ayudante de Primera',
    funcion: 'Jefe Departamento Intendencia',
    email: 'castrohmartin@hotmail.com',
    jerarquia: 'sargento',
    cuerpo: 'activo',
  },
  {
    apellido: 'Benítez',
    nombre: 'Flavio Mauricio',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Jefe Departamento Equipos Autónomos',
    email: 'flaviomauriciobenitez@gmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Corradi',
    nombre: 'Pablo Germán',
    jerarquiaReal: 'Oficial Aux. de Dotación',
    funcion: 'Jefe Sección Capacitación',
    email: 'corradipablo@yahoo.com.ar',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Cabrera',
    nombre: 'Ángel',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Automotores',
    email: 'angeljuandomingocabrera@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Nagele',
    nombre: 'Claudio',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'claudionagele@hotmail.com.ar',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Decker',
    nombre: 'Horacio',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Equipos y Materiales',
    email: 'horapio1@hotmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Benítez',
    nombre: 'Gustavo Ángel',
    jerarquiaReal: 'Comandante',
    funcion: 'Jefe Sección Equipos y Materiales',
    email: 'benitezdaniel298@gmail.com',
    jerarquia: 'comandante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Moreda',
    nombre: 'Maximiliano Alberto',
    jerarquiaReal: 'Oficial Aux. de Escuadra',
    funcion: 'Jefe Destacamento',
    email: 'maximoreda79@hotmail.com',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Jaime',
    nombre: 'Gastón Horacio',
    jerarquiaReal: 'Ayudante de Primera',
    funcion: 'Ayudante 1ra · Equipos Autónomos',
    email: 'gastonj308@hotmail.com',
    jerarquia: 'sargento',
    cuerpo: 'activo',
  },
  {
    apellido: 'Percara',
    nombre: 'Sergio',
    jerarquiaReal: 'Oficial Aux. de Escuadra',
    funcion: 'Jefe Sección Ayudantía · Cómputos',
    email: 'smp310x@gmail.com',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Lemos',
    nombre: 'Cristian Ariel',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Equipos y Materiales',
    email: 'cai78@hotmail.com.ar',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Sosa',
    nombre: 'José Miguel',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Hidráulica',
    email: 'stop-fire@live.com.ar',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Corradi',
    nombre: 'Sergio Martín',
    jerarquiaReal: 'Oficial Aux. de Dotación',
    funcion: 'Jefe Sección Ayudantía',
    email: 'smcfires@gmail.com',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Astorga',
    nombre: 'Federico',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'federico.emanuel.astorga@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Rolón',
    nombre: 'Noelia',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'noeliarolon35@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Del Pilar',
    nombre: 'Walter Damián',
    jerarquiaReal: 'Ayudante de Primera',
    funcion: 'Ayudante 1ra · Intendencia',
    email: 'walteryluz@hotmail.com',
    jerarquia: 'sargento',
    cuerpo: 'activo',
  },
  {
    apellido: 'Alegre',
    nombre: 'Damián',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'damianalegre.da@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Machado',
    nombre: 'Alejandro',
    jerarquiaReal: 'Oficial Auxiliar',
    funcion: 'Ayudante · Capacitación Interna',
    email: 'ale368@hotmail.es',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Calchei',
    nombre: 'Nicolás',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Capacitación',
    email: 'nicolas372@gmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Romero Esperón',
    nombre: 'Martín Oscar',
    jerarquiaReal: 'Oficial Auxiliar',
    funcion: 'Jefe Sección Equipos',
    email: 'martinromero107@gmail.com',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Moreda',
    nombre: 'Juan Antonio',
    jerarquiaReal: 'Ayudante',
    funcion: 'Jefe Departamento Intendencia',
    email: 'juanmoreda387@gmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Machado',
    nombre: 'Matías Daniel',
    jerarquiaReal: 'Ayudante Mayor',
    funcion: 'Ayudante Mayor · Ayudantía',
    email: 'machado.matias@hotmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Uttone',
    nombre: 'Horacio',
    jerarquiaReal: 'Oficial Aux. de Dotación',
    funcion: 'Jefe Sección Capacitación',
    email: 'horaciouttone@gmail.com',
    jerarquia: 'oficial',
    cuerpo: 'activo',
  },
  {
    apellido: 'Quinteiro',
    nombre: 'Javier',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Jefe Sección Automotores',
    email: 'javierquinteiro25@gmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ferreyra',
    nombre: 'Gustavo',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Automotores',
    email: 'ferreirag163@gmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Oyarzo',
    nombre: 'Marcelo',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Ayudante · Escuela Zonal',
    email: 'oyarzo020380@gmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ferreiro Vargas',
    nombre: 'Luis',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Ayudante · Capacitación Interna',
    email: 'guardiaballester@hotmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Carrizo',
    nombre: 'Jorge Alfredo',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Ayudantía',
    email: 'carrizojorge@yahoo.com.ar',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Cervone',
    nombre: 'Adrián',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Intendencia',
    email: 'adrian22-torres@hotmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Maidana',
    nombre: 'Rubén Jorge',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Ayudantía',
    email: 'rjorgemaidana1@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Kawerin',
    nombre: 'Víctor',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Intendencia',
    email: 'vic_kaw@hotmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Niemann',
    nombre: 'Gustavo Ezequiel',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Intendencia',
    email: 'niemannezequiel1@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Lupo',
    nombre: 'Martín',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Automotores',
    email: 'martindaniell16@yahoo.com.ar',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Trejo',
    nombre: 'Karina',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Ayudante · Capacitación Interna',
    email: 'karinatrejo72@hotmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Quinteiro',
    nombre: 'Sergio Alex',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Automotores',
    email: 'sergioqq66@gmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Martillota',
    nombre: 'Gabriel',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Equipos',
    email: 'gabriel107419@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Casal',
    nombre: 'Fernando Diego Ernesto',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Mantenimiento',
    email: 'casalfernando@ymail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Deluca',
    nombre: 'Luciano Luis',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Automotores',
    email: 'lucianoldeluca.97@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'López',
    nombre: 'Martín',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Equipos y Materiales',
    email: 'sebastianlopez997@gmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Garone',
    nombre: 'Gian Franco',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'gian.garone@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Nehring',
    nombre: 'Alesis Daniel',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Cómputos',
    email: 'nehringalesis@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Mendoza',
    nombre: 'Alan',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Equipos y Materiales',
    email: 'alangabrielmendoza181@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Karpencopf',
    nombre: 'Sebastián',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Intendencia',
    email: 'polacocrossfire442@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ponce',
    nombre: 'Hernán Alcides',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Intendencia',
    email: 'hernanseguridad408@gmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Martilotta',
    nombre: 'Esteban',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos Portantes',
    email: 'martilottaesteban@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ramírez Maidana',
    nombre: 'Miguel Ángel',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Equipos Autónomos',
    email: 'fulminar@outlook.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ramírez',
    nombre: 'Facundo Nahuel',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Pañol de Materiales',
    email: 'facu_nahuramirez@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Russo',
    nombre: 'Germán Ernesto',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Ayudantía',
    email: 'germanrusso426.gr@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Schmit',
    nombre: 'Alberto',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Pañol de Materiales',
    email: 'albertobro1404@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Onorati',
    nombre: 'Mauro Matías',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Automotores',
    email: 'mauro_5150@hotmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
  {
    apellido: 'Santacatalina',
    nombre: 'Franco',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'franhi02@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Polito',
    nombre: 'Alejandro Ariel',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'alejandroakd1@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Pose',
    nombre: 'Martín Nicolás',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Intendencia',
    email: 'martinpose20@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Jaime',
    nombre: 'Mariano Nicolás',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Automotores',
    email: 'marianonjaime84@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Espíndola',
    nombre: 'Néstor Fabián',
    jerarquiaReal: 'Ayudante de Primera',
    funcion: 'Ayudante 1ra · Ropería',
    email: 'sebas.ferrari12@hotmail.com',
    jerarquia: 'sargento',
    cuerpo: 'activo',
  },
  {
    apellido: 'Cella',
    nombre: 'Karen Lourdes',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos Contra Incendio y Rescate',
    email: 'karenlourdess@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ruiz Saporati',
    nombre: 'Catalina',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos Contra Incendio y Rescate',
    email: 'cataruizsapo2001@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Grzina',
    nombre: 'Ivanna Yamila',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'ivannaghys@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Giménez',
    nombre: 'Germán',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'germanggimenez320@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Quinteros',
    nombre: 'Nahuel Nicolás',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Automotores',
    email: 'nnquinteros@hotmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Bonasera',
    nombre: 'Carlos',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'valenbonasera99@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ferrari',
    nombre: 'Sebastián',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'sebas.ferrari12.bv@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Giménez',
    nombre: 'Andrés',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Automotores',
    email: 'andres_clg2@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ramos',
    nombre: 'Manuel',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'manuelagustinramos05@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Marinaro',
    nombre: 'Mauro',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'mmarinaro6@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ojeda',
    nombre: 'Ignacio',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'nachoojeda611@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Ferrari',
    nombre: 'Juan Cruz',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'juan.cruz.ferrari@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'García',
    nombre: 'Néstor',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Intendencia',
    email: 'nestorgarciaadrian2018@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Weber',
    nombre: 'Nicolás',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Automotores',
    email: 'nicolasweber33@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Arguello',
    nombre: 'Gustavo Hernán',
    jerarquiaReal: 'Ayudante Ppal.',
    funcion: 'Encargado Ropería · Sub Encargado Dto.',
    email: 'gustavo-fireman@hotmail.com',
    jerarquia: 'sargento_ayudante',
    cuerpo: 'activo',
  },
  {
    apellido: 'Martín',
    nombre: 'Facundo Alejandro',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Ropería',
    email: 'facuale101931@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Domínguez',
    nombre: 'Gastón Ariel',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'gastondominguez2013@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Cordero Méndez',
    nombre: 'Valentino',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Mantenimiento',
    email: 'valentinocorderomendez@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Colman',
    nombre: 'Mateo',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos Contra Incendio y Rescate',
    email: 'colmanmateo96@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Arrieta',
    nombre: 'María Rosa',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'maru.arrieta@hotmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Baroffio',
    nombre: 'Anahí',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'anabarofio1@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Pallotto',
    nombre: 'Daniela Soledad',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'pallottodaniela@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Benítez',
    nombre: 'Rocío Camila',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'rociocamilabenitez2@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Molina',
    nombre: 'Gastón Agustín',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Equipos y Materiales',
    email: 'agustinmolinagaston@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Pousa',
    nombre: 'Gustavo Pablo',
    jerarquiaReal: 'Auxiliar',
    funcion: 'Jefe Departamento Informe Técnico · Habilitaciones',
    email: 'ingpousa@yahoo.com.ar',
    jerarquia: 'bombero',
    cuerpo: 'administrativo',
  },
  {
    apellido: 'Sandoval',
    nombre: 'Jeremías',
    jerarquiaReal: 'Bombero',
    funcion: 'Bombero · Intendencia',
    email: 'jeresandoval578@gmail.com',
    jerarquia: 'bombero',
    cuerpo: 'activo',
  },
  {
    apellido: 'Zalazar',
    nombre: 'Aníbal',
    jerarquiaReal: 'Sub.Ayudante',
    funcion: 'Sub Ayudante · Equipos Autónomos',
    email: 'guiligan475@gmail.com',
    jerarquia: 'bombero_1ra',
    cuerpo: 'activo',
  },
  {
    apellido: 'Leguizamón',
    nombre: 'Lautaro',
    jerarquiaReal: 'Ayudante',
    funcion: 'Ayudante · Equipos Autónomos',
    email: 'lautaro_460@hotmail.com',
    jerarquia: 'cabo',
    cuerpo: 'activo',
  },
];

// ─────────────────────────────────────────────────────────────────
// MAPEO DE PREFIJOS PARA IDs DE PERSONAS
// Los 9 cuarteles originales conservan sus prefijos para no romper
// referencias en contactos-red.ts (sm-001, si-001, tg-001, etc.)
// ─────────────────────────────────────────────────────────────────

const PREFIJO_OVERRIDE: Record<string, string> = {
  'cuartel-san-martin': 'sm',
  'cuartel-san-isidro': 'si',
  'cuartel-tigre': 'tg',
  'cuartel-quilmes': 'qm',
  'cuartel-lomas-de-zamora': 'lz',
  'cuartel-lanus': 'ln',
  'cuartel-moron': 'mo',
  'cuartel-tres-de-febrero': 'tf',
  'cuartel-ituzaingo': 'iz',
};

function prefijoCuartel(cuartelId: string): string {
  if (PREFIJO_OVERRIDE[cuartelId]) return PREFIJO_OVERRIDE[cuartelId];
  const slug = cuartelId.replace('cuartel-', '');
  const partes = slug.split('-');
  if (partes.length >= 2) {
    return (partes[0]![0]! + partes[1]![0]! + (partes[0]!.length > 1 ? partes[0]![1]! : '')).slice(
      0,
      3,
    );
  }
  return slug.slice(0, 3);
}

// Telefonos pseudo-aleatorios pero determinísticos (basados en idx)
function telPara(idx: number, prefijo: string): string {
  const tel = 4000 + ((idx * 137 + prefijo.length * 13) % 5999);
  const ext = 1000 + ((idx * 71) % 8999);
  return `+54 11 ${tel} ${ext}`;
}

// Especialidades rotadas por jerarquía
const ESPECIALIDADES_POOL: EspecialidadBombero[][] = [
  ['hazmat', 'rescate_vehicular'],
  ['rescate_acuatico'],
  ['rescate_altura', 'busqueda_rescate'],
  ['primeros_auxilios', 'desfibrilador'],
  ['conductor_maquinista'],
  ['forestal'],
  ['comunicaciones'],
  ['hazmat'],
  ['rescate_vehicular'],
  [],
];

function generarPersonaParaCuartel(
  cuartelId: string,
  matricula: string,
  fuente: BomberoFuente,
  idxLocal: number,
  idxGlobal: number,
  _cuartelNombre: string,
  cuartelRegion: string,
): Persona {
  const prefijo = prefijoCuartel(cuartelId);
  const id = `${prefijo}-${(idxLocal + 1).toString().padStart(3, '0')}`;
  const legajo = `${matricula.replace('BV-', '')}/${(100 + idxLocal).toString().padStart(4, '0')}`;
  const emailDomain = `bv-${prefijo}.org`;
  const emailUsuario = fuente.email.split('@')[0]!.replace(/[^a-z0-9.]/gi, '');
  const email = `${emailUsuario}@${emailDomain}`;
  const baseList = ['Cuartel Central', 'Destacamento Nº1', 'Destacamento Nº2'];
  const base = baseList[idxLocal % baseList.length]!;
  const esp =
    fuente.cuerpo === 'administrativo'
      ? undefined
      : ESPECIALIDADES_POOL[idxGlobal % ESPECIALIDADES_POOL.length]!.length > 0
        ? ESPECIALIDADES_POOL[idxGlobal % ESPECIALIDADES_POOL.length]
        : undefined;

  const perfiles: Persona['perfiles'] =
    fuente.jerarquia === 'comandante' || fuente.jerarquia === 'sub_comandante'
      ? ['mando', 'bombero']
      : fuente.cuerpo === 'administrativo'
        ? ['administrativo']
        : ['bombero'];

  // Enriquecemos con datos REALES del padrón rotando.
  // Cada persona recibe los campos extendidos del legajo de un padronFuente
  // diferente — el apellido/nombre/email/jerarquía vienen de FUENTE, pero el
  // DNI/domicilio/altura/peso/etc del padrón.
  const padron = padronFuente[idxGlobal % padronFuente.length]!;
  const sexoLegajo: LegajoExtra['sexo'] = padron.sexo === 'Femenino' ? 'Femenino' : 'Masculino';

  const fechaNacimiento =
    padron.fechaNacimiento ||
    `19${60 + (idxGlobal % 30)}-${String((idxGlobal % 12) + 1).padStart(2, '0')}-${String((idxGlobal % 28) + 1).padStart(2, '0')}`;
  const fechaIngreso =
    padron.fechaAlta ||
    `20${10 + (idxGlobal % 15)}-${String((idxGlobal % 12) + 1).padStart(2, '0')}-${String((idxGlobal % 28) + 1).padStart(2, '0')}`;

  const legajoExtra: LegajoExtra = {
    dni: padron.dni,
    sexo: sexoLegajo,
    jerarquiaReal: fuente.jerarquiaReal,
    cargoInstitucion: padron.cargoInstitucion || 'Numerario',
    cargoFederativo: padron.cargoFederativo,
    escalafon:
      padron.escalafon || (fuente.cuerpo === 'administrativo' ? 'C.Directiva' : 'Cuerpo Activo'),
    fechaJerarquia: padron.fechaJerarquia,
    fechaAlta: padron.fechaAlta || fechaIngreso,
    domicilio: padron.domicilio,
    localidad: padron.localidad,
    codigoPostal: padron.codigoPostal,
    partido: padron.partido,
    provincia: padron.provincia || 'Buenos Aires',
    pais: padron.pais || 'Argentina',
    lugarNacimiento: padron.lugarNacimiento,
    provinciaNacimiento: padron.provinciaNacimiento || 'Buenos Aires',
    estadoCivil: padron.estadoCivil || 'Soltero',
    altura: padron.altura,
    peso: padron.peso,
    donante: (padron.donante as 'SI' | 'NO' | '') || 'NO',
    celular: padron.celular || telPara(idxGlobal + 1000, prefijo).replace('+54 11 ', '11'),
    ciaCelular: padron.ciaCelular || 'Personal',
    emailFederativo: `${legajo.replace('/', '.')}@federacionbomberos.org.ar`,
    ioma: padron.ioma,
    observaciones: padron.observaciones,
    acta: padron.acta,
    libro: padron.libro,
    calificaComputos: 'SI',
    informaComputos: 'SI',
    region: cuartelRegion,
    escuela: padron.escuela,
  };
  // Damos consistencia: el nombre/apellido de la persona también pueden venir
  // del padrón cuando NO se trate de un jefe — para mezclar con los nombres de FUENTE.
  // (Mantenemos FUENTE como prioridad para preservar la coherencia de jefes/jerarquías).

  return {
    id,
    cuartelId,
    legajo,
    nombre: fuente.nombre,
    apellido: fuente.apellido,
    email,
    telefono: telPara(idxGlobal, prefijo),
    fechaNacimiento,
    fechaIngreso,
    jerarquia: fuente.jerarquia,
    estado: 'activo',
    base: padron.base || base,
    funcion: fuente.funcion,
    perfiles,
    cuerpo: fuente.cuerpo,
    especialidades: esp,
    salud: {
      grupoSanguineo: padron.grupoSangre || 'O+',
      aptitudVencimiento: '2026-12-01',
    },
    cursos: [],
    legajoExtra,
  };
}

// Generador principal: para cada cuartel (excepto Villa Ballester, que vive en personas.ts),
// crear 3-7 personas usando la fuente real rotada.
const VILLA_BALLESTER_ID = 'cuartel-villa-ballester';

let _globalIdx = 0;
export const personasFederacionMock: Persona[] = cuartelesMock
  .filter((c) => c.id !== VILLA_BALLESTER_ID)
  .flatMap((cuartel, cuartelIdx) => {
    // Variar cantidad: 3 a 7 personas por cuartel
    const cantidad = 3 + (cuartelIdx % 5);
    const personas: Persona[] = [];

    // Primero el jefe (un comandante de la fuente)
    const jefesPool = FUENTE.filter(
      (f) => f.jerarquia === 'comandante' || f.jerarquia === 'sub_comandante',
    );
    const jefe = jefesPool[cuartelIdx % jefesPool.length]!;
    personas.push(
      generarPersonaParaCuartel(
        cuartel.id,
        cuartel.matricula ?? 'BV-0000',
        jefe,
        0,
        _globalIdx++,
        cuartel.nombre,
        cuartel.region,
      ),
    );

    // Resto de personas, rotando por jerarquía variada
    for (let i = 1; i < cantidad; i++) {
      const fuenteIdx = (cuartelIdx * 7 + i * 3) % FUENTE.length;
      const f = FUENTE[fuenteIdx]!;
      personas.push(
        generarPersonaParaCuartel(
          cuartel.id,
          cuartel.matricula ?? 'BV-0000',
          f,
          i,
          _globalIdx++,
          cuartel.nombre,
          cuartel.region,
        ),
      );
    }

    return personas;
  });
