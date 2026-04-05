// src/utils/migrateLegacy.ts

import { DayHistory } from '@/data/missions'

const MISSION_MAP: Record<string, string[]> = {
  'Check-In':             ['Check-in'],
  'Spoil':                ['Espólios'],
  'Espólios':             ['Espólios'],
  'Hell Gate':            ['Portão Infernal'],
  'Portão Infernal':      ['Portão Infernal'],
  'Mortal Quests':        ['Expedição'],
  'Expedição':            ['Expedição'],
  'Unknown Desert':       ['Deserto Desconhecido'],
  'Deserto Desconhecido': ['Deserto Desconhecido'],
  'Wanted Monster':       ['Contrato de Caça'],
  'Contrato de Caça':     ['Contrato de Caça'],
  'Event - Spoil TP':     ['Teleporte Premium', 'Desafio'],
  'Evento - Espólios TP': ['Teleporte Premium', 'Desafio'],
  'Dragon Field':         [], // ignorar
}

interface LegacyProfile {
  historico: { data: string; itens: string[] }[]
  notes: string
  estado: { checks: boolean[] }
}

interface LegacyJson {
  profiles: string[]
  profileData: Record<string, LegacyProfile>
}

export interface MigratedProfile {
  name: string
  history: DayHistory[]
}

function mapMissions(itens: string[]): { missions: string[]; eventActive: boolean } {
  const missions: string[] = []
  let eventActive = false

  itens.forEach(item => {
    const mapped = MISSION_MAP[item]
    if (mapped === undefined) {
      // nome não reconhecido — mantém original
      missions.push(item)
      return
    }
    if (mapped.length === 0) return // ignorar (Dragon Field)
    mapped.forEach(m => {
      if (!missions.includes(m)) missions.push(m)
    })
    // Se mapeou para evento, marca eventActive
    if (mapped.includes('Teleporte Premium') || mapped.includes('Desafio')) {
      eventActive = true
    }
  })

  return { missions, eventActive }
}

export function migrateLegacyJson(raw: string): MigratedProfile[] | null {
  try {
    const data: LegacyJson = JSON.parse(raw)

    if (!data.profiles || !data.profileData) return null

    return data.profiles.map((name, idx) => {
      const profileData = data.profileData[String(idx)]
      const history: DayHistory[] = (profileData?.historico ?? []).map(entry => {
        const { missions, eventActive } = mapMissions(entry.itens)
        return {
          date: entry.data,
          missions,
          eventActive,
        }
      })

      return { name, history }
    })
  } catch {
    return null
  }
}