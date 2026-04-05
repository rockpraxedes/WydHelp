// src/data/runas.ts

export interface Runa {
  id: string
  name: string
  img: string
}

export interface Receita {
  id: string
  name: string
  img: string
  runas: { runaId: string; quantidade: number }[]
}

export interface Pista {
  nivel: number
  label: string
  runas: string[]
}

export const RUNAS: Runa[] = [
  { id: 'ansuz',     name: 'Ansuz',     img: '/src/images/runas/ansuz.png' },
  { id: 'berkano',   name: 'Berkano',   img: '/src/images/runas/berkano.png' },
  { id: 'dagaz',     name: 'Dagaz',     img: '/src/images/runas/dagaz.png' },
  { id: 'ehwaz',     name: 'Ehwaz',     img: '/src/images/runas/ehwaz.png' },
  { id: 'eihwaz',    name: 'Eihwaz',    img: '/src/images/runas/eihwaz.png' },
  { id: 'elhaz',     name: 'Elhaz',     img: '/src/images/runas/elhaz.png' },
  { id: 'fehu',      name: 'Fehu',      img: '/src/images/runas/fehu.png' },
  { id: 'gebo',      name: 'Gebo',      img: '/src/images/runas/gebo.png' },
  { id: 'hagalaz',   name: 'Hagalaz',   img: '/src/images/runas/hagalaz.png' },
  { id: 'ing',       name: 'Ing',       img: '/src/images/runas/ing.png' },
  { id: 'isa',       name: 'Isa',       img: '/src/images/runas/isa.png' },
  { id: 'jara',      name: 'Jara',      img: '/src/images/runas/jara.png' },
  { id: 'kenaz',     name: 'Kenaz',     img: '/src/images/runas/kenaz.png' },
  { id: 'laguz',     name: 'Laguz',     img: '/src/images/runas/laguz.png' },
  { id: 'mannaz',    name: 'Mannaz',    img: '/src/images/runas/mannaz.png' },
  { id: 'naudhiz',   name: 'Naudhiz',   img: '/src/images/runas/naudhiz.png' },
  { id: 'othel',     name: 'Othel',     img: '/src/images/runas/othel.png' },
  { id: 'perthro',   name: 'Perthro',   img: '/src/images/runas/perthro.png' },
  { id: 'raidho',    name: 'Raidho',    img: '/src/images/runas/raidho.png' },
  { id: 'sowilo',    name: 'Sowilo',    img: '/src/images/runas/sowilo.png' },
  { id: 'thurisaz',  name: 'Thurisaz',  img: '/src/images/runas/thurisaz.png' },
  { id: 'tiwaz',     name: 'Tiwaz',     img: '/src/images/runas/tiwaz.png' },
  { id: 'uraz',      name: 'Uraz',      img: '/src/images/runas/uraz.png' },
  { id: 'wunjo',     name: 'Wunjo',     img: '/src/images/runas/wunjo.png' },
  { id: 'pergaminho', name: 'Pergaminho', img: '/src/images/runas/pergaminho.png' },
  { id: 'selo',       name: 'Selo',       img: '/src/images/runas/selo.png' },
]

export const RECEITAS: Receita[] = [
  {
    id: 'sol',
    name: 'Pedra Secreta do Sol',
    img: '/src/images/pedras/sol.png',
    runas: [
      { runaId: 'ansuz',    quantidade: 1 },
      { runaId: 'elhaz',    quantidade: 1 },
      { runaId: 'gebo',     quantidade: 1 },
      { runaId: 'mannaz',   quantidade: 1 },
      { runaId: 'raidho',   quantidade: 1 },
      { runaId: 'sowilo',   quantidade: 1 },
      { runaId: 'tiwaz',    quantidade: 1 },
    ],
  },
  {
    id: 'terra',
    name: 'Pedra Secreta da Terra',
    img: '/src/images/pedras/terra.png',
    runas: [
      { runaId: 'dagaz',    quantidade: 1 },
      { runaId: 'fehu',     quantidade: 1 },
      { runaId: 'kenaz',    quantidade: 1 },
      { runaId: 'naudhiz',  quantidade: 1 },
      { runaId: 'sowilo',   quantidade: 1 },
      { runaId: 'thurisaz', quantidade: 1 },
      { runaId: 'raidho',   quantidade: 1 },
    ],
  },
  {
    id: 'agua',
    name: 'Pedra Secreta da Água',
    img: '/src/images/pedras/agua.png',
    runas: [
      { runaId: 'berkano',  quantidade: 1 },
      { runaId: 'isa',      quantidade: 1 },
      { runaId: 'jara',     quantidade: 1 },
      { runaId: 'raidho',   quantidade: 1 },
      { runaId: 'sowilo',   quantidade: 1 },
      { runaId: 'uraz',     quantidade: 1 },
      { runaId: 'wunjo',    quantidade: 1 },
    ],
  },
  {
    id: 'vento',
    name: 'Pedra Secreta do Vento',
    img: '/src/images/pedras/vento.png',
    runas: [
      { runaId: 'ehwaz',    quantidade: 1 },
      { runaId: 'ansuz',    quantidade: 1 },
      { runaId: 'ing',      quantidade: 1 },
      { runaId: 'isa',      quantidade: 1 },
      { runaId: 'laguz',    quantidade: 1 },
      { runaId: 'othel',    quantidade: 1 },
      { runaId: 'perthro',  quantidade: 1 },
    ],
  },
  {
    id: 'furia',
    name: 'Pedra da Fúria',
    img: '/src/images/pedras/furia.png',
    runas: [
      { runaId: 'sowilo',   quantidade: 1 },
      { runaId: 'kenaz',    quantidade: 1 },
      { runaId: 'uraz',     quantidade: 1 },
      { runaId: 'thurisaz', quantidade: 1 },
      { runaId: 'isa',      quantidade: 1 },
      { runaId: 'tiwaz',    quantidade: 1 },
      { runaId: 'hagalaz',  quantidade: 1 },
    ],
  },
  {
    id: 'destrave',
    name: 'Destrave Nível 40',
    img: '/src/images/pedras/capa.png',
    runas: [
      { runaId: 'pergaminho', quantidade: 2 },
      { runaId: 'pergaminho', quantidade: 2 },
      { runaId: 'selo',       quantidade: 1 },
      { runaId: 'fehu',       quantidade: 1 },
      { runaId: 'mannaz',     quantidade: 1 },
      { runaId: 'thurisaz',   quantidade: 1 },
      { runaId: 'ansuz',      quantidade: 1 },
    ],
  },
]

export const PISTAS: Pista[] = [
  { nivel: 0, label: 'Pista +0', runas: ['ansuz', 'uraz', 'thurisaz', 'fehu', 'raidho'] },
  { nivel: 1, label: 'Pista +1', runas: ['thurisaz', 'fehu', 'raidho', 'kenaz', 'naudhiz', 'gebo'] },
  { nivel: 2, label: 'Pista +2', runas: ['kenaz', 'naudhiz', 'gebo', 'wunjo', 'hagalaz', 'isa'] },
  { nivel: 3, label: 'Pista +3', runas: ['isa', 'jara', 'eihwaz', 'perthro', 'elhaz', 'sowilo', 'berkano', 'selo'] },
  { nivel: 4, label: 'Pista +4', runas: ['elhaz', 'sowilo', 'berkano', 'ehwaz', 'tiwaz', 'mannaz', 'laguz'] },
  { nivel: 5, label: 'Pista +5', runas: ['wunjo', 'hagalaz', 'isa', 'jara', 'eihwaz', 'perthro'] },
  { nivel: 6, label: 'Pista +6', runas: ['tiwaz', 'mannaz', 'laguz', 'dagaz', 'ing', 'othel'] },
]

// Retorna em quais pistas uma runa dropa
export function pistasParaRuna(runaId: string): Pista[] {
  return PISTAS.filter(p => p.runas.includes(runaId))
}