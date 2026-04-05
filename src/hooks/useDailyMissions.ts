// src/hooks/useDailyMissions.ts

import { useState, useCallback, useEffect } from 'react'
import { DayHistory } from '@/data/missions'
import { DAILY_MISSIONS } from '@/data/missions'

const HISTORY_KEY = (profileId: string) => `wyd_history_${profileId}`
const DAY_KEY     = (profileId: string, dateKey: string) => `wyd_day_${profileId}_${dateKey}`

interface TodayState {
  checked: Record<string, boolean>
  eventActive: boolean
}

function loadForDate(profileId: string, dateKey: string): TodayState {
  try {
    const raw = localStorage.getItem(DAY_KEY(profileId, dateKey))
    if (raw) return JSON.parse(raw)
  } catch {}
  return { checked: {}, eventActive: false }
}

function saveForDate(profileId: string, dateKey: string, state: TodayState) {
  localStorage.setItem(DAY_KEY(profileId, dateKey), JSON.stringify(state))
}

export function loadHistory(profileId: string): DayHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY(profileId))
    if (raw) {
      const hist: DayHistory[] = JSON.parse(raw)
      // Ordena por data mais recente primeiro
      return hist.sort((a, b) => {
        const parse = (d: string) => {
          const [day, month, year] = d.split('/').map(Number)
          return new Date(year, month - 1, day).getTime()
        }
        return parse(b.date) - parse(a.date)
      })
    }
  } catch {}
  return []
}

function saveHistory(profileId: string, history: DayHistory[]) {
  localStorage.setItem(HISTORY_KEY(profileId), JSON.stringify(history.slice(0, 60)))
}

// Converte nomes de missões salvas em estado de checks
function missionsToChecked(missions: string[]): Record<string, boolean> {
  const checked: Record<string, boolean> = {}
  DAILY_MISSIONS.forEach(m => {
    checked[m.id] = missions.includes(m.name)
  })
  return checked
}

export function useDailyMissions(profileId: string, dateKey: string) {
  const [state, setState]     = useState<TodayState>(() => loadForDate(profileId, dateKey))
  const [history, setHistory] = useState<DayHistory[]>(() => loadHistory(profileId))

  useEffect(() => {
    const fromStorage = loadForDate(profileId, dateKey)

    // Se não há estado salvo mas há entrada no histórico, restaura os checks
    const hasStoredState = !!localStorage.getItem(DAY_KEY(profileId, dateKey))
    if (!hasStoredState) {
      const histEntry = loadHistory(profileId).find(h => h.date === dateKey)
      if (histEntry) {
        const restored: TodayState = {
          checked: missionsToChecked(histEntry.missions),
          eventActive: histEntry.eventActive,
        }
        setState(restored)
        return
      }
    }

    setState(fromStorage)
    setHistory(loadHistory(profileId))
  }, [profileId, dateKey])

  const toggle = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, checked: { ...prev.checked, [id]: !prev.checked[id] } }
      saveForDate(profileId, dateKey, next)
      return next
    })
  }, [profileId, dateKey])

  const toggleEvent = useCallback((active: boolean) => {
    setState(prev => {
      const next = { ...prev, eventActive: active }
      saveForDate(profileId, dateKey, next)
      return next
    })
  }, [profileId, dateKey])

  const saveDay = useCallback((missionNames: string[]) => {
    if (!missionNames.length) return false
    const entry: DayHistory = { date: dateKey, missions: missionNames, eventActive: state.eventActive }
    const updated = loadHistory(profileId)
    const idx = updated.findIndex(h => h.date === dateKey)
    if (idx >= 0) updated[idx] = entry
    else updated.unshift(entry)
    saveHistory(profileId, updated)
    setHistory(loadHistory(profileId))
    return true
  }, [profileId, dateKey, state.eventActive])

  return { checked: state.checked, eventActive: state.eventActive, history, toggle, toggleEvent, saveDay }
}