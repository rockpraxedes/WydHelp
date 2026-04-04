// src/pages/Home.tsx

import { DailyTracker } from '@/components/DailyTracker'
import { ScheduleBoard } from '@/components/ScheduleBoard'

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Esquerda — missões + histórico */}
          <div>
            <DailyTracker />
          </div>

          {/* Direita — relógio + quadro de horários */}
          <div className="lg:sticky lg:top-8">
            <ScheduleBoard />
          </div>

        </div>
      </div>
    </div>
  )
}