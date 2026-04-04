// src/pages/Home.tsx

import { useState } from 'react'
import { DailyTracker } from '@/components/DailyTracker'
import { ScheduleBoard } from '@/components/ScheduleBoard'
import { Runas } from '@/pages/Runas'
import { cn } from '@/lib/utils'

type Tab = 'missoes' | 'runas'

export function Home() {
  const [tab, setTab] = useState<Tab>('missoes')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Nav */}
        <nav className="flex items-center gap-1 border-b pb-0">
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
                  ? 'border-emerald-500 text-emerald-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Conteúdo */}
        {tab === 'missoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <DailyTracker />
            </div>
            <div className="lg:sticky lg:top-8">
              <ScheduleBoard />
            </div>
          </div>
        )}

        {tab === 'runas' && (
          <Runas />
        )}

      </div>
    </div>
  )
}