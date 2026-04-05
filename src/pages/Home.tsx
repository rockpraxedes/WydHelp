// src/pages/Home.tsx

import { useState } from 'react'
import { DailyTracker } from '@/components/DailyTracker'
import { ScheduleBoard } from '@/components/ScheduleBoard'
import { Runas } from '@/pages/Runas'
import { useProfiles } from '@/hooks/useProfiles'
import { ProfileSelector } from '@/components/ProfileSelector'
import { cn } from '@/lib/utils'

type Tab = 'missoes' | 'runas' 

export function Home() {
  const [tab, setTab] = useState<Tab>('missoes')

  const {
    profiles, activeId: profileId, setActive,
    addProfile, renameProfile, deleteProfile,
    exportProfile, importAny,
  } = useProfiles()

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── HEADER ── */}
      <header className="relative w-full overflow-hidden" style={{ height: '180px' }}>

        
        <img
            src="/src/images/header3.png"
            alt="WYD Global"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-full object-cover object-center"
            style={{
              objectPosition: 'center 52%',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
          />
        
        


         {/* Botão site do jogo — canto superior direito */}
        <div className="absolute top-3 right-4 z-50">
          <a
            href="https://wydglobal.raidhut.com/pt-br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(109,40,217,0.35)',
              border: '1px solid rgba(167,139,250,0.45)',
              backdropFilter: 'blur(8px)',
              borderRadius: '999px',
              padding: '6px 14px',
              textDecoration: 'none',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            WYD Global
          </a>
        </div>

        {/* Título centralizado */}

        {/* Conteúdo do header 
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-8 bg-violet-400 opacity-70" />
            <span className="text-[10px] tracking-[0.3em] text-violet-300 uppercase font-medium">
              Guia de Missões
            </span>
            <div className="h-px w-8 bg-violet-400 opacity-70" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide text-white drop-shadow-lg">
            Wyd<span className="text-violet-400">Help</span>
          </h1>
        </div>*/}
      </header>

      {/* ── CONTEÚDO ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Nav */}
        <nav className="flex items-center gap-1 border-b">
          {([
            { id: 'missoes', label: 'Missões' },
            { id: 'runas',   label: 'Runas & Crafting' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2 text-sm transition-colors border-b-2 -mb-px',
                tab === t.id
                  ? 'border-violet-500 text-violet-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'missoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <DailyTracker
              key={profileId}
              profileId={profileId}
              profileSelector={
                <ProfileSelector
                  profiles={profiles}
                  activeId={profileId}
                  onSelect={setActive}
                  onAdd={addProfile}
                  onRename={renameProfile}
                  onDelete={(id) => deleteProfile(id, profileId)}
                  onExport={exportProfile}
                  onImportAny={importAny}
                />
              }
            />
            <div className="lg:sticky lg:top-6">
              <ScheduleBoard />
            </div>
          </div>
        )}

        {tab === 'runas' && <Runas />}

      </main>
      <div className="pb-10"></div>

      {/* ── RODAPÉ ── */}
      <footer className="fixed bottom-0 left-0 w-full border-t py-4 bg-background z-50">
  <p className="text-center text-xs text-muted-foreground">
    © {new Date().getFullYear()} · Desenvolvido por{' '}
    <span className="text-violet-500 font-medium">Sérgio Praxedes</span>
  </p>
</footer>

    </div>
  )
}