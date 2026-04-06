// src/pages/Runas.tsx

import { RUNAS, RECEITAS, pistasParaRuna } from '@/data/runas'
import { useEstoque } from '@/hooks/useEstoque'
import { Toast } from '@/hooks/useToast'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RunasProps {
  onToast: (msg: string, type?: Toast['type']) => void
}

interface RunaItemProps {
  runaId: string
  quantidade: number
  tenho: number
  onAdd: () => void
  onRemove: () => void
}

function RunaItem({ runaId, quantidade, tenho, onAdd, onRemove }: RunaItemProps) {
  const runa = RUNAS.find(r => r.id === runaId)!
  const ok   = tenho >= quantidade

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        {tenho > 0 && (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold flex items-center justify-center transition-colors"
            title="Remover 1"
          >×</button>
        )}
        <button
          onClick={onAdd}
          className="absolute -top-1.5 -left-1.5 z-10 flex items-center gap-0.5 text-white text-[10px] font-bold rounded-full px-1 min-w-[18px] h-[18px] justify-center transition-colors"
          style={{ background: ok ? '#7c3aed' : '#dc2626' }}
          title="Adicionar 1"
        >
          {tenho > 99 ? '99+' : tenho}
        </button>
        <img
          src={runa.img}
          alt={runa.name}
          className={cn(
            'w-11 h-11 object-contain cursor-pointer transition-all hover:scale-110',
            !ok && 'opacity-30 grayscale'
          )}
          onClick={onAdd}
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight w-12 truncate" title={runa.name}>
        {runa.name}
      </span>
    </div>
  )
}

interface ReceitaCardProps {
  receita: typeof RECEITAS[0]
  estoque: Record<string, number>
  onAdd: (runaId: string) => void
  onRemove: (runaId: string) => void
  onVender: () => void
}

function ReceitaCard({ receita, estoque, onAdd, onRemove, onVender }: ReceitaCardProps) {
  const tenhoTotal   = receita.runas.reduce((acc, r) => acc + Math.min(estoque[r.runaId] ?? 0, r.quantidade), 0)
  const precisoTotal = receita.runas.reduce((acc, r) => acc + r.quantidade, 0)
  const progresso    = Math.min(tenhoTotal / precisoTotal, 1)
  const posso        = Math.min(...receita.runas.map(r => Math.floor((estoque[r.runaId] ?? 0) / r.quantidade)))
  const falta        = receita.runas.filter(r => (estoque[r.runaId] ?? 0) < r.quantidade)
  const pronto       = falta.length === 0

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-4 transition-all',
      pronto ? 'border-violet-400' : 'border-border'
    )}>
      <div className="flex items-center gap-3">
        <img
          src={receita.img}
          alt={receita.name}
          className="w-12 h-12 object-contain shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium">{receita.name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {pronto
              ? <span className="text-xs font-medium text-violet-600">✓ Pronto!</span>
              : <span className="text-xs text-muted-foreground">Faltam {falta.length} runa(s)</span>
            }
            <span className="text-xs text-muted-foreground">
              Craftáveis: <span className="font-medium text-foreground">{posso}×</span>
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', pronto ? 'bg-violet-500' : 'bg-violet-300')}
              style={{ width: `${progresso * 100}%` }}
            />
          </div>
        </div>
        <button
          onClick={onVender}
          disabled={!pronto}
          className={cn(
            'shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all',
            pronto
              ? 'border-violet-500 text-violet-600 hover:bg-violet-50 active:scale-95'
              : 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
          )}
        >
          Vender
        </button>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        {receita.runas.map(({ runaId, quantidade }, idx) => (
          <RunaItem
            key={`${receita.id}-${runaId}-${idx}`}
            runaId={runaId}
            quantidade={quantidade}
            tenho={estoque[runaId] ?? 0}
            onAdd={() => onAdd(runaId)}
            onRemove={() => onRemove(runaId)}
          />
        ))}
      </div>
    </div>
  )
}

interface ReceitaGroupProps {
  titulo: string
  lista: typeof RECEITAS
  estoque: Record<string, number>
  onAdd: (runaId: string) => void
  onRemove: (runaId: string) => void
  onVender: (receitaId: string) => void
}

function ReceitaGroup({ titulo, lista, estoque, onAdd, onRemove, onVender }: ReceitaGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{titulo}</p>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lista.map(receita => (
          <ReceitaCard
            key={receita.id}
            receita={receita}
            estoque={estoque}
            onAdd={onAdd}
            onRemove={onRemove}
            onVender={() => onVender(receita.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function Runas({ onToast }: RunasProps) {
  const { estoque, incrementar, craftaveis, faltando } = useEstoque()

  const handleVender = (receitaId: string) => {
    const receita = RECEITAS.find(r => r.id === receitaId)
    if (!receita || craftaveis(receita.runas) < 1) return
    receita.runas.forEach(({ runaId, quantidade }) => incrementar(runaId, -quantidade))
    onToast(`${receita.name} vendida!`, 'success')
  }

  const secretas = RECEITAS.filter(r => ['sol', 'terra', 'agua', 'vento'].includes(r.id))
  const outros   = RECEITAS.filter(r => !['sol', 'terra', 'agua', 'vento'].includes(r.id))

  const todasFaltando = RECEITAS.flatMap(receita =>
    faltando(receita.runas, 1).map(f => ({ ...f, receita: receita.name }))
  ).reduce<Record<string, { runaId: string; receitas: string[] }>>((acc, { runaId, receita }) => {
    if (!acc[runaId]) acc[runaId] = { runaId, receitas: [] }
    if (!acc[runaId].receitas.includes(receita)) acc[runaId].receitas.push(receita)
    return acc
  }, {})

  const faltaGlobal = Object.values(todasFaltando)

  return (
    <div className="space-y-8">
      <ReceitaGroup
        titulo="Pedras Secretas"
        lista={secretas}
        estoque={estoque}
        onAdd={(id) => incrementar(id, 1)}
        onRemove={(id) => incrementar(id, -1)}
        onVender={handleVender}
      />
      <ReceitaGroup
        titulo="Outros"
        lista={outros}
        estoque={estoque}
        onAdd={(id) => incrementar(id, 1)}
        onRemove={(id) => incrementar(id, -1)}
        onVender={handleVender}
      />

      {faltaGlobal.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Onde farmar</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            {faltaGlobal.map(({ runaId, receitas }) => {
              const runa   = RUNAS.find(r => r.id === runaId)!
              const pistas = pistasParaRuna(runaId)
              return (
                <div key={runaId} className="flex items-center gap-2 flex-wrap">
                  <img src={runa.img} alt={runa.name} className="w-5 h-5 object-contain shrink-0" />
                  <span className="text-xs font-medium w-16 shrink-0">{runa.name}</span>
                  <div className="flex gap-1 flex-wrap">
                    {pistas.map(p => (
                      <Badge key={p.nivel} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        {p.label}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-auto hidden sm:block">
                    {receitas.join(', ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}