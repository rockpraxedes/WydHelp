// src/components/DailyTracker.tsx

import { useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { useDailyMissions } from '@/hooks/useDailyMissions'
import { useProfiles } from '@/hooks/useProfiles'
import { DAILY_MISSIONS } from '@/data/missions'
import { ProfileSelector } from '@/components/ProfileSelector'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CheckIcon, CalendarIcon } from 'lucide-react'

export function DailyTracker() {
  const { activeId: profileId } = useProfiles()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calOpen, setCalOpen] = useState(false)

  const dateKey = selectedDate.toLocaleDateString('pt-BR')
  const isToday = dateKey === new Date().toLocaleDateString('pt-BR')

  const { checked, eventActive, history, toggle, toggleEvent, saveDay } = useDailyMissions(profileId, dateKey)

  const fixedMissions = DAILY_MISSIONS.filter(m => !m.isEvent)
  const eventMissions = DAILY_MISSIONS.filter(m => m.isEvent)
  const visibleAll    = eventActive ? DAILY_MISSIONS : fixedMissions
  const total         = visibleAll.length
  const doneCount     = visibleAll.filter(m => checked[m.id]).length

  const handleSave = () => {
    const names = visibleAll.filter(m => checked[m.id]).map(m => m.name)
    const ok = saveDay(names)
    if (!ok) alert('Marque ao menos uma missão!')
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">Missões do dia</h2>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted/50',
                !isToday && 'border-amber-400 text-amber-700 bg-amber-50'
              )}>
                <CalendarIcon className="w-3 h-3" />
                {isToday ? `Hoje · ${dateKey}` : dateKey}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { if (date) { setSelectedDate(date); setCalOpen(false) } }}
                locale={ptBR}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Seletor de perfil */}
          <ProfileSelector onProfileChange={() => {}} />

          <div className="w-px h-4 bg-border" />

          {/* Switch evento */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Evento</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium transition-colors',
                eventActive
                  ? 'border-amber-400 text-amber-600 bg-amber-50'
                  : 'text-muted-foreground'
              )}
            >
              {eventActive ? 'ON' : 'OFF'}
            </Badge>
            <Switch checked={eventActive} onCheckedChange={toggleEvent} />
          </div>
        </div>
      </div>

      {/* Progresso */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{doneCount} de {total} concluídas</p>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Diárias */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Diárias</p>
        {fixedMissions.map(mission => (
          <MissionCard
            key={mission.id}
            name={mission.name}
            checked={!!checked[mission.id]}
            onClick={() => toggle(mission.id)}
          />
        ))}
      </div>

      {/* Evento */}
      {eventActive && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Evento</p>
          {eventMissions.map(mission => (
            <MissionCard
              key={mission.id}
              name={mission.name}
              checked={!!checked[mission.id]}
              isEvent
              onClick={() => toggle(mission.id)}
            />
          ))}
        </div>
      )}

      {/* Salvar */}
      <Button
        variant="outline"
        className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
        onClick={handleSave}
      >
        Salvar progresso do dia
      </Button>

      {/* Histórico */}
      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-base font-medium">Histórico</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum dia salvo ainda.</p>
        ) : (
          history.map(entry => (
            <div
              key={entry.date}
              className={cn(
                'rounded-lg bg-muted/50 p-3 space-y-2 cursor-pointer transition-colors hover:bg-muted',
                entry.date === dateKey && 'ring-1 ring-emerald-400'
              )}
              onClick={() => {
                const [d, m, y] = entry.date.split('/').map(Number)
                setSelectedDate(new Date(y, m - 1, d))
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{entry.date}</span>
                <span className="text-xs text-muted-foreground">{entry.missions.length} missão(ões)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.missions.map(name => (
                  <Badge key={name} variant="outline" className="text-xs font-normal">
                    {name}
                  </Badge>
                ))}
                {entry.eventActive && (
                  <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                    Evento
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface MissionCardProps {
  name: string
  checked: boolean
  isEvent?: boolean
  onClick: () => void
}

function MissionCard({ name, checked, isEvent = false, onClick }: MissionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors',
        'hover:bg-muted/50',
        isEvent && 'border-amber-300',
        checked && 'opacity-60'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors',
          checked
            ? isEvent
              ? 'bg-amber-500 border-amber-500'
              : 'bg-emerald-500 border-emerald-500'
            : 'border-border'
        )}
      >
        {checked && <CheckIcon className="w-3 h-3 text-white" />}
      </div>
      <span className={cn('text-sm flex-1', checked && 'line-through text-muted-foreground')}>
        {name}
      </span>
    </button>
  )
}