// src/data/missions.ts

export interface DailyMission {
  id: string
  name: string
  isEvent: boolean
  isGuild?: boolean
}

export interface ScheduledMission {
  id: string
  name: string
  times: string[] // "HH:MM"
  type: 'fixed' | 'interval'
  intervalMinutes?: number[] // para Expedição: [4, 14, 24]
}

export interface DayHistory {
  date: string // "dd/MM/yyyy"
  missions: string[]
  eventActive: boolean
  guildActive: boolean
}

export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'checkin', name: 'Check-in', isEvent: false },
  { id: 'espolios', name: 'Espólios', isEvent: false },
  { id: 'portal', name: 'Portão Infernal', isEvent: false },
  { id: 'contrato', name: 'Contrato de Caça', isEvent: false },
  { id: 'expedicao', name: 'Expedição', isEvent: false },
  { id: 'deserto', name: 'Deserto Desconhecido', isEvent: false },
  { id: 'intelreport', name: 'Intel Report', isEvent: false, isGuild: true },
  { id: 'teleporte', name: 'Teleporte Premium', isEvent: true },
  { id: 'desafio', name: 'Desafio', isEvent: true },
]

export const SCHEDULED_MISSIONS: ScheduledMission[] = [
  {
    id: 'portal',
    name: 'Portão Infernal',
    type: 'fixed',
    times: [ '02:00', '02:30', '06:00', '06:30', '10:00', '10:30', '14:00', '14:30', '18:00', '18:30', '22:00', '22:30' ],
  },
  {
    id: 'expedicao',
    name: 'Expedição',
    type: 'interval',
    times: [],
    intervalMinutes: [ 4, 14, 24 ],
  },
  {
    id: 'arena',
    name: 'Arena',
    type: 'fixed',
    times: [ '13:00', '19:00', '20:30', '23:00' ],
  },
]