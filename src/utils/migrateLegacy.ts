// src/utils/migrateLegacy.ts

import { DayHistory } from '@/data/missions'

const MIGRATION_DONE_KEY = 'wyd_migration_v1_done'

// ── Mapeamento de missões ──────────────────────────────────────────────────
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
  'Dragon Field':         [],
  'No dailies completed': [],
}

// Mapeamento de runas — chave antiga → chave nova (algumas tinham typos)
const RUNA_MAP: Record<string, string> = {
  anzuz:    'ansuz',
  berkano:  'berkano',
  dagaz:    'dagaz',
  ehwaz:    'ehwaz',
  eihwaz:   'eihwaz',
  elhaz:    'elhaz',
  fehu:     'fehu',
  gebo:     'gebo',
  hagalaz:  'hagalaz',
  ing:      'ing',
  isa:      'isa',
  jara:     'jara',
  kenaz:    'kenaz',
  laguz:    'laguz',
  mannaz:   'mannaz',
  naudhiz:  'naudhiz',
  othel:    'othel',
  perthro:  'perthro',
  raidho:   'raidho',
  sowilo:   'sowilo',
  thurisaz: 'thurisaz',
  tiwaz:    'tiwaz',
  uraz:     'uraz',
  wunjo:    'wunjo',
}

function mapMissions(itens: string[]): { missions: string[]; eventActive: boolean } {
  const missions: string[] = []
  let eventActive = false
  itens.forEach(item => {
    const mapped = MISSION_MAP[item]
    if (mapped === undefined) { if (item) missions.push(item); return }
    if (mapped.length === 0) return
    mapped.forEach(m => { if (!missions.includes(m)) missions.push(m) })
    if (mapped.includes('Teleporte Premium')) eventActive = true
  })
  return { missions, eventActive }
}

function genId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function parseHistory(historico: { data: string; itens: string[] }[]): DayHistory[] {
  return historico.map(entry => {
    const { missions, eventActive } = mapMissions(entry.itens)
    return { date: entry.data, missions, eventActive }
  }).sort((a, b) => {
    const parse = (d: string) => {
      const [day, month, year] = d.split('/').map(Number)
      return new Date(year, month - 1, day).getTime()
    }
    return parse(b.date) - parse(a.date)
  })
}

// ── Migração principal ────────────────────────────────────────────────────
export function runMigrationIfNeeded(): void {
  // Só roda uma vez
  if (localStorage.getItem(MIGRATION_DONE_KEY)) return

  // Verifica se tem dados do site antigo
  const hasLegacy =
    localStorage.getItem('profiles') ||
    localStorage.getItem('historicoDiarias') ||
    localStorage.getItem('inventario_wyd')

  if (!hasLegacy) {
    localStorage.setItem(MIGRATION_DONE_KEY, '1')
    return
  }

  console.log('[WydHelp] Migrando dados do site antigo...')

  // ── 1. Migrar perfis e históricos ─────────────────────────────────────
  const profileNamesRaw = localStorage.getItem('profiles')
  const profileDataRaw  = localStorage.getItem('profileData')

  if (profileNamesRaw && profileDataRaw) {
    try {
      const profileNames: string[] = JSON.parse(profileNamesRaw)
      const profileData: Record<string, {
        historico: { data: string; itens: string[] }[]
        estado?: { checks: boolean[] }
      }> = JSON.parse(profileDataRaw)

      const newProfiles: { id: string; name: string; createdAt: string }[] = []

      profileNames.forEach((name, idx) => {
        const data = profileData[String(idx)]
        if (!data) return

        const id = genId()
        newProfiles.push({ id, name, createdAt: new Date().toISOString() })

        // Salva histórico migrado
        const history = parseHistory(data.historico ?? [])
        localStorage.setItem(`wyd_history_${id}`, JSON.stringify(history))
      })

      // Salva perfis no novo formato (sem sobrescrever se já existirem)
      const existingProfilesRaw = localStorage.getItem('wyd_profiles')
      const existingProfiles = existingProfilesRaw ? JSON.parse(existingProfilesRaw) : []
      const merged = [...existingProfiles, ...newProfiles]
      localStorage.setItem('wyd_profiles', JSON.stringify(merged))

      // Ativa o primeiro perfil migrado se não houver ativo
      if (!localStorage.getItem('wyd_active_profile') && newProfiles.length > 0) {
        localStorage.setItem('wyd_active_profile', newProfiles[0].id)
      }

    } catch (e) {
      console.warn('[WydHelp] Erro ao migrar perfis:', e)
    }
  }

  // ── 2. Migrar historicoDiarias avulso (perfil "Geral" se não tiver perfis) ──
  const historicoDiariasRaw = localStorage.getItem('historicoDiarias')
  if (historicoDiariasRaw && !profileNamesRaw) {
    try {
      const historico = JSON.parse(historicoDiariasRaw)
      const history   = parseHistory(historico)
      const id        = genId()
      const profile   = { id, name: 'Principal', createdAt: new Date().toISOString() }

      localStorage.setItem(`wyd_history_${id}`, JSON.stringify(history))
      localStorage.setItem('wyd_profiles', JSON.stringify([profile]))
      localStorage.setItem('wyd_active_profile', id)
    } catch (e) {
      console.warn('[WydHelp] Erro ao migrar historicoDiarias:', e)
    }
  }

  // ── 3. Migrar inventário de runas ──────────────────────────────────────
  const inventarioRaw = localStorage.getItem('inventario_wyd')
  if (inventarioRaw) {
    try {
      const inventario: Record<string, number> = JSON.parse(inventarioRaw)
      const novoEstoque: Record<string, number> = {}

      Object.entries(inventario).forEach(([chaveAntiga, qtd]) => {
        const novaChave = RUNA_MAP[chaveAntiga] ?? chaveAntiga
        novoEstoque[novaChave] = (novoEstoque[novaChave] ?? 0) + qtd
      })

      // Só salva se não tiver estoque novo já
      if (!localStorage.getItem('wyd_estoque_runas')) {
        localStorage.setItem('wyd_estoque_runas', JSON.stringify(novoEstoque))
      }
    } catch (e) {
      console.warn('[WydHelp] Erro ao migrar inventário:', e)
    }
  }

  // Marca como feita
  localStorage.setItem(MIGRATION_DONE_KEY, '1')
  console.log('[WydHelp] Migração concluída!')
}

// ── Exportado também para importação manual via JSON ──────────────────────
export function migrateLegacyJson(raw: string): { name: string; history: DayHistory[] }[] | null {
  try {
    const data = JSON.parse(raw)
    if (!data.profiles || !data.profileData) return null

    return (data.profiles as string[]).map((name: string, idx: number) => {
      const profileData = data.profileData[String(idx)]
      const history = parseHistory(profileData?.historico ?? [])
      return { name, history }
    })
  } catch {
    return null
  }
}