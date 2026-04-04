// src/hooks/useDailyMissions.ts

import { useState, useCallback, useEffect } from 'react'
import { DayHistory } from '@/data/missions'

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
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveHistory(profileId: string, history: DayHistory[]) {
  localStorage.setItem(HISTORY_KEY(profileId), JSON.stringify(history.slice(0, 30)))
}

export function useDailyMissions(profileId: string, dateKey: string) {
  const [state, setState]   = useState<TodayState>(() => loadForDate(profileId, dateKey))
  const [history, setHistory] = useState<DayHistory[]>(() => loadHistory(profileId))

  // Recarrega quando muda perfil ou data
  useEffect(() => {
    setState(loadForDate(profileId, dateKey))
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
    setHistory([...updated])
    return true
  }, [profileId, dateKey, state.eventActive])

  return { checked: state.checked, eventActive: state.eventActive, history, toggle, toggleEvent, saveDay }
}