// src/pages/Home.tsx

import { useState } from 'react'
import { DailyTracker } from '@/components/DailyTracker'
import { ScheduleBoard } from '@/components/ScheduleBoard'
import { Runas } from '@/pages/Runas'
import { useProfiles } from '@/hooks/useProfiles'
import { useToast } from '@/hooks/useToast'
import { ProfileSelector } from '@/components/ProfileSelector'
import { ToastContainer } from '@/components/ToastContainer'
import { cn } from '@/lib/utils'
import { SwordIcon, GemIcon, ClockIcon } from 'lucide-react'

type Tab = 'missoes' | 'runas'
type MissaoSubTab = 'diarias' | 'horarios'

export function Home() {
  const [tab, setTab]               = useState<Tab>('missoes')
  const [missaoSubTab, setMissaoSubTab] = useState<MissaoSubTab>('diarias')

  const { toasts, addToast, removeToast } = useToast()

  const {
    profiles, activeId: profileId, setActive,
    addProfile, renameProfile, deleteProfile,
    exportProfile, importAny,
  } = useProfiles()

  const activeProfile = profiles.find(p => p.id === profileId)

  const NAV_TABS = [
    { id: 'missoes' as Tab, label: 'Missões',        Icon: SwordIcon },
    { id: 'runas'   as Tab, label: 'Runas & Crafting', Icon: GemIcon  },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── HEADER ── */}
      <header className="relative w-full overflow-hidden" style={{ height: '200px' }}>
        <img
          src="/images/header3.png"
          alt="WYD Global"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.3) 100%)'
        }} />

        {/* Perfil ativo — canto superior esquerdo */}
        {activeProfile && (
          <div className="absolute top-3 left-4">
            <div
              className="flex items-center gap-2 text-xs text-white/80"
              style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(6px)',
                borderRadius: '999px',
                padding: '5px 12px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              {activeProfile.name}
            </div>
          </div>
        )}

        {/* Botão site do jogo — canto superior direito */}
        <div className="absolute top-3 right-4">
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
            Jogar WYD Global
          </a>
        </div>

        {/* Título */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-8 bg-violet-400 opacity-70" />
            <span className="text-[10px] tracking-[0.3em] text-violet-300 uppercase font-medium">
              Guia de Missões
            </span>
            <div className="h-px w-8 bg-violet-400 opacity-70" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide text-white drop-shadow-lg">
            WYD<span className="text-violet-400">Help</span>
          </h1>
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Nav principal */}
        <nav className="flex items-center gap-1 border-b">
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2 -mb-px',
                tab === id
                  ? 'border-violet-500 text-violet-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* ── ABA MISSÕES ── */}
        {tab === 'missoes' && (
          <>
            {/* Sub-nav mobile — Diárias | Horários */}
            <div className="flex lg:hidden gap-1 bg-muted/50 rounded-lg p-1">
              {([
                { id: 'diarias',  label: 'Diárias',   Icon: SwordIcon },
                { id: 'horarios', label: 'Horários',   Icon: ClockIcon },
              ] as { id: MissaoSubTab; label: string; Icon: typeof SwordIcon }[]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setMissaoSubTab(id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors',
                    missaoSubTab === id
                      ? 'bg-background text-violet-600 font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Coluna esquerda — Diárias (esconde no mobile quando aba Horários ativa) */}
              <div className={cn(missaoSubTab === 'horarios' ? 'hidden lg:block' : 'block')}>
                <DailyTracker
                  key={profileId}
                  profileId={profileId}
                  onToast={addToast}
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
              </div>

              {/* Coluna direita — Horários (esconde no mobile quando aba Diárias ativa) */}
              <div className={cn(
                'lg:sticky lg:top-6',
                missaoSubTab === 'diarias' ? 'hidden lg:block' : 'block'
              )}>
                <ScheduleBoard />
              </div>
            </div>
          </>
        )}

        {tab === 'runas' && <Runas onToast={addToast} />}

      </main>

      {/* ── RODAPÉ ── */}
      <footer className="border-t py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} · Desenvolvido por{' '}
          <span className="text-violet-500 font-medium">Sérgio Praxedes</span>
        </p>
      </footer>

      {/* ── TOASTS ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  )
}