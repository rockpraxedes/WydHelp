// src/hooks/useProfiles.ts

import { useState, useCallback } from 'react'
import { migrateLegacyJson } from '@/utils/migrateLegacy'

export interface Profile {
  id: string
  name: string
  createdAt: string
}

const PROFILES_KEY = 'wyd_profiles'
const ACTIVE_KEY   = 'wyd_active_profile'
const HISTORY_KEY  = (id: string) => `wyd_history_${id}`

const DEFAULT_PROFILES: Profile[] = [
  { id: 'principal',  name: 'Principal',  createdAt: new Date().toISOString() },
  { id: 'secundario', name: 'Secundário', createdAt: new Date().toISOString() },
  { id: 'terciario',  name: 'Terciário',  createdAt: new Date().toISOString() },
]

function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  saveProfiles(DEFAULT_PROFILES)
  return DEFAULT_PROFILES
}

function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function loadActiveId(profiles: Profile[]): string {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (raw && profiles.find(p => p.id === raw)) return raw
  } catch {}
  return profiles[0]?.id ?? ''
}

function genId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function purgeProfileData(profileId: string) {
  Object.keys(localStorage)
    .filter(k => k.includes(profileId))
    .forEach(k => localStorage.removeItem(k))
}

export function useProfiles() {
  const [profiles, setProfiles]      = useState<Profile[]>(loadProfiles)
  const [activeId, setActiveIdState] = useState<string>(() => loadActiveId(loadProfiles()))

  const setActive = useCallback((id: string) => {
    setActiveIdState(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }, [])

  const addProfile = useCallback((name: string): string => {
    const newProfile: Profile = { id: genId(), name: name.trim(), createdAt: new Date().toISOString() }
    setProfiles(prev => {
      const updated = [...prev, newProfile]
      saveProfiles(updated)
      return updated
    })
    return newProfile.id
  }, [])

  const renameProfile = useCallback((id: string, name: string) => {
    setProfiles(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, name: name.trim() } : p)
      saveProfiles(updated)
      return updated
    })
  }, [])

  const deleteProfile = useCallback((id: string, currentActiveId: string) => {
    setProfiles(prev => {
      if (prev.length <= 1) return prev
      const updated = prev.filter(p => p.id !== id)
      saveProfiles(updated)
      purgeProfileData(id)
      if (currentActiveId === id) {
        const fallback = updated[0].id
        setActiveIdState(fallback)
        localStorage.setItem(ACTIVE_KEY, fallback)
      }
      return updated
    })
  }, [])

  const exportProfile = useCallback((id: string) => {
    const profiles = loadProfiles()
    const profile = profiles.find(p => p.id === id)
    if (!profile) return
    const data: Record<string, string> = { _profile: JSON.stringify(profile) }
    Object.keys(localStorage)
      .filter(k => k.includes(id))
      .forEach(k => { data[k] = localStorage.getItem(k) ?? '' })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wydhelp_${profile.name.toLowerCase().replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importProfile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string
        const data: Record<string, string> = JSON.parse(raw)
        const profile: Profile = JSON.parse(data._profile)
        const existingProfiles = loadProfiles()
        const exists = existingProfiles.find(p => p.id === profile.id)
        const finalId = exists ? genId() : profile.id
        const finalProfile = { ...profile, id: finalId }
        Object.entries(data).forEach(([k, v]) => {
          if (k === '_profile') return
          localStorage.setItem(k.replace(profile.id, finalId), v)
        })
        setProfiles(prev => {
          const updated = [...prev, finalProfile]
          saveProfiles(updated)
          return updated
        })
        setActive(finalId)
      } catch {
        alert('Arquivo inválido!')
      }
    }
    reader.readAsText(file)
  }, [setActive])

  // Importação do JSON legado — cria todos os perfis de uma vez
  const importLegacy = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const raw = e.target?.result as string
      const migrated = migrateLegacyJson(raw)

      if (!migrated) {
        alert('Arquivo inválido ou formato não reconhecido!')
        return
      }

      const newProfiles: Profile[] = migrated.map(p => ({
        id: genId(),
        name: p.name,
        createdAt: new Date().toISOString(),
      }))

      // Salva histórico de cada perfil
      newProfiles.forEach((profile, idx) => {
        localStorage.setItem(HISTORY_KEY(profile.id), JSON.stringify(migrated[idx].history))
      })

      setProfiles(prev => {
        const updated = [...prev, ...newProfiles]
        saveProfiles(updated)
        return updated
      })

      // Ativa o primeiro perfil importado
      setActive(newProfiles[0].id)

      alert(`${newProfiles.length} perfil(is) importado(s) com sucesso!`)
    }
    reader.readAsText(file)
  }, [setActive])

  const activeProfile = profiles.find(p => p.id === activeId) ?? profiles[0]

  return {
    profiles, activeId, activeProfile,
    setActive, addProfile, renameProfile, deleteProfile,
    exportProfile, importProfile, importLegacy,
  }
}