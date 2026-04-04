// src/components/ScheduleBoard.tsx

import { useMemo } from 'react'
import { useBrasiliaTime } from '@/hooks/useBrasiliaTime'
import { SCHEDULED_MISSIONS } from '@/data/missions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toTotalSeconds(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 3600 + m * 60
}

function formatCountdown(diffSec: number): string {
  if (diffSec <= 0) return ''
  const h = Math.floor(diffSec / 3600)
  const m = Math.floor((diffSec % 3600) / 60)
  const s = diffSec % 60
  if (h > 0) return `em ${h}h ${pad(m)}min`
  if (m > 0) return `em ${pad(m)}min ${pad(s)}s`
  return `em ${pad(s)}s`
}

function getNextExpedicaoSlots(now: Date, count = 3): string[] {
  const MINUTES = [4, 14, 24]
  const results: string[] = []
  let h = now.getHours()
  let m = now.getMinutes()
  let iterations = 0

  while (results.length < count && iterations < 200) {
    iterations++
    const nextMin = MINUTES.find(em => em > m) ?? null
    if (nextMin !== null) {
      results.push(`${pad(h)}:${pad(nextMin)}`)
      m = nextMin
    } else {
      h = (h + 1) % 24
      m = -1
    }
  }
  return results
}

function getNextExpedicaoSec(now: Date): { sec: number; label: string } {
  const EXP_MINUTES = [4, 14, 24]
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const curMin = now.getMinutes()
  const curSec = now.getSeconds()
  const nextMin = EXP_MINUTES.find(m => m > curMin) ?? null

  let diffSec: number
  let label: string

  if (nextMin !== null) {
    diffSec = (nextMin - curMin) * 60 - curSec
    label = `${pad(now.getHours())}:${pad(nextMin)}`
  } else {
    const nextH = (now.getHours() + 1) % 24
    diffSec = (EXP_MINUTES[0] + 60 - curMin) * 60 - curSec
    label = `${pad(nextH)}:${pad(EXP_MINUTES[0])}`
  }

  return { sec: nowSec + diffSec, label }
}

function findNextFixed(times: string[], nowSec: number): { nextSec: number; nextLabel: string } {
  const sorted = [...times].sort()
  const found = sorted.find(t => toTotalSeconds(t) > nowSec)
  const label = found ?? sorted[0]
  let nextSec = toTotalSeconds(label)
  if (!found) nextSec += 86400
  return { nextSec, nextLabel: label }
}

function getGlobalNext(now: Date): { names: string[]; label: string } | null {
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

  const fixedCandidates = SCHEDULED_MISSIONS
    .filter(m => m.type === 'fixed')
    .flatMap(m =>
      m.times.map(t => ({
        name: m.name,
        label: t,
        sec: toTotalSeconds(t) > nowSec ? toTotalSeconds(t) : toTotalSeconds(t) + 86400,
      }))
    )

  const exp = getNextExpedicaoSec(now)
  const expCandidate = { name: 'Expedição', label: exp.label, sec: exp.sec }

  const candidates = [...fixedCandidates, expCandidate]
  const minSec = Math.min(...candidates.map(c => c.sec))
  const tied = candidates.filter(c => c.sec === minSec)
  return { names: tied.map(c => c.name), label: tied[0].label }
}

export function ScheduleBoard() {
  const now = useBrasiliaTime()

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const nowSec  = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

  const globalNext = useMemo(() => getGlobalNext(now), [now])
  const expSlots   = useMemo(() => getNextExpedicaoSlots(now, 3), [now])

  return (
    <div className="space-y-6">

      {/* Relógio */}
      <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Horário de Brasília</p>
          <p className="text-3xl font-medium tabular-nums tracking-wide">{timeStr}</p>
        </div>
        {globalNext && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Próxima missão</p>
            <p className="text-sm font-medium">{globalNext.names.join(' + ')}</p>
            <p className="text-xl font-medium text-emerald-600 tabular-nums">{globalNext.label}</p>
          </div>
        )}
      </div>

      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Quadro de horários
      </p>

      {/* Portão Infernal */}
      <FixedMissionBlock
        name="Portão Infernal"
        times={SCHEDULED_MISSIONS.find(m => m.id === 'portal')!.times}
        nowSec={nowSec}
      />

      {/* Expedição */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="font-medium text-sm">Expedição</p>
        <p className="text-xs text-muted-foreground">Toda hora, nos minutos 04 · 14 · 24</p>
        <div className="flex flex-wrap gap-2">
          {expSlots.map((slot, i) => (
            <Badge
              key={slot}
              variant="outline"
              className={cn(
                'text-sm tabular-nums px-3 py-1 font-normal',
                i === 0 && 'border-emerald-500 text-emerald-600 bg-emerald-50 font-medium'
              )}
            >
              {slot}
            </Badge>
          ))}
        </div>
        <ExpCountdown now={now} />
      </div>

      {/* Arena */}
      <FixedMissionBlock
        name="Arena"
        times={SCHEDULED_MISSIONS.find(m => m.id === 'arena')!.times}
        nowSec={nowSec}
      />
    </div>
  )
}

interface FixedMissionBlockProps {
  name: string
  times: string[]
  nowSec: number
}

function FixedMissionBlock({ name, times, nowSec }: FixedMissionBlockProps) {
  const { nextLabel, nextSec } = findNextFixed(times, nowSec)
  const diff = nextSec - nowSec

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="font-medium text-sm">{name}</p>
      <div className="flex flex-wrap gap-2">
        {times.map(t => {
          const sec = toTotalSeconds(t)
          const isNext = t === nextLabel
          const isPast = sec < nowSec && !isNext
          return (
            <Badge
              key={t}
              variant="outline"
              className={cn(
                'text-sm tabular-nums px-3 py-1 font-normal transition-all',
                isNext && 'border-emerald-500 text-emerald-600 bg-emerald-50 font-medium',
                isPast && 'opacity-35'
              )}
            >
              {t}
            </Badge>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">{formatCountdown(diff)}</p>
    </div>
  )
}

function ExpCountdown({ now }: { now: Date }) {
  const EXP_MINUTES = [4, 14, 24]
  const curMin = now.getMinutes()
  const curSec = now.getSeconds()
  const nextMin = EXP_MINUTES.find(m => m > curMin) ?? EXP_MINUTES[0]
  let diffSec = (nextMin - curMin) * 60 - curSec
  if (diffSec <= 0) diffSec += 3600
  return <p className="text-xs text-muted-foreground">{formatCountdown(diffSec)}</p>
}