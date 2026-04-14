// src/pages/Ranking.tsx

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrophyIcon, UserIcon, ArrowUpDownIcon, ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

const API_URL = process.env.NODE_ENV === 'development'
  ? '/api/royal-arena'
  : '/ranking.json'

const CLASS_MAP: Record<string, string> = {
  '0': 'TK',
  '1': 'FM',
  '2': 'BM',
  '3': 'HT',
}

function getClassName( classId: number ) {
  return CLASS_MAP[ String( classId ) ] ?? '?'
}

const CLASS_BADGE_VARIANT: Record<string, string> = {
  TK: 'bg-teal-100  text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
  HT: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  FM: 'bg-rose-100  text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  BM: 'bg-lime-100  text-lime-700 border-lime-300 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700',
}

interface Player {
  charName: string
  class: number
  subClass: number
  wins: number
  kills: number
  deaths: number
  points: number
}

type SortKey = 'rank' | 'charName' | 'class' | 'points' | 'wins' | 'kills' | 'deaths'
type SortDir = 'asc' | 'desc'
type TabType = 'champion' | 'aspirant'

interface SortState { key: SortKey; dir: SortDir }

function SortIcon( { col, sort }: { col: SortKey; sort: SortState } ) {
  if ( sort.key !== col ) return <ArrowUpDownIcon className="w-3 h-3 opacity-40" />
  return sort.dir === 'desc'
    ? <ArrowDownIcon className="w-3 h-3 text-violet-500" />
    : <ArrowUpIcon className="w-3 h-3 text-violet-500" />
}

function RankBadge( { rank }: { rank: number } ) {
  if ( rank === 1 ) return <span className="text-amber-500 font-semibold">{rank}</span>
  if ( rank === 2 ) return <span className="text-slate-400 font-semibold">{rank}</span>
  if ( rank === 3 ) return <span className="text-amber-700 font-semibold">{rank}</span>
  return <span className="text-muted-foreground">{rank}</span>
}

export function Ranking() {
  const [ data, setData ] = useState<{ champion: Player[]; aspirant: Player[] } | null>( null )
  const [ loading, setLoading ] = useState( true )
  const [ error, setError ] = useState<string | null>( null )
  const [ tab, setTab ] = useState<TabType>( 'champion' )
  const [ search, setSearch ] = useState( '' )
  const [ sort, setSort ] = useState<SortState>( { key: 'points', dir: 'desc' } )

  useEffect( () => {
    fetch( API_URL )
      .then( r => { if ( !r.ok ) throw new Error(); return r.json() } )
      .then( d => { setData( d ); setLoading( false ) } )
      .catch( () => { setError( 'Não foi possível carregar o ranking.' ); setLoading( false ) } )
  }, [] )

  const rows = useMemo( () => {
    if ( !data ) return []
    const list = ( data[ tab ] ?? [] ).map( ( p, i ) => ( { ...p, _origRank: i + 1 } ) )
    const filtered = search.trim()
      ? list.filter( p => p.charName.toLowerCase().includes( search.toLowerCase() ) )
      : list
    return [ ...filtered ].sort( ( a, b ) => {
      const mul = sort.dir === 'desc' ? -1 : 1
      if ( sort.key === 'rank' ) return ( a._origRank - b._origRank ) * mul
      if ( sort.key === 'charName' ) return a.charName.localeCompare( b.charName ) * mul
      if ( sort.key === 'class' ) return getClassName( a.class ).localeCompare( getClassName( b.class ) ) * mul
      return ( ( a[ sort.key as keyof Player ] as number ?? 0 ) - ( b[ sort.key as keyof Player ] as number ?? 0 ) ) * mul
    } )
  }, [ data, tab, search, sort ] )

  function toggleSort( key: SortKey ) {
    setSort( prev => prev.key === key
      ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
      : { key, dir: 'desc' }
    )
  }

  const TABS = [
    { id: 'champion' as TabType, label: 'Champion', Icon: TrophyIcon },
    { id: 'aspirant' as TabType, label: 'Aspirant', Icon: UserIcon },
  ]

  const COLS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'rank', label: '#', className: 'w-10' },
    { key: 'charName', label: 'Personagem' },
    { key: 'class', label: 'Classe' },
    { key: 'points', label: 'Pontos' },
    { key: 'wins', label: 'Vitórias' },
    { key: 'kills', label: 'Kills' },
    { key: 'deaths', label: 'Mortes' },
  ]

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Pesquisar personagem..."
          value={search}
          onChange={e => setSearch( e.target.value )}
          className="w-full max-w-sm rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-violet-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch( '' )} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Limpar
          </button>
        )}
      </div>

      <nav className="flex items-center gap-1 border-b">
        {TABS.map( ( { id, label, Icon } ) => (
          <button
            key={id}
            onClick={() => setTab( id )}
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
        ) )}
      </nav>

      <div className="rounded-xl border bg-card overflow-hidden">
        {loading && <p className="py-12 text-center text-sm text-muted-foreground">Carregando ranking...</p>}
        {error && <p className="py-12 text-center text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {COLS.map( col => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort( col.key )}
                      className={cn(
                        'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors',
                        col.className
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <SortIcon col={col.key} sort={sort} />
                      </span>
                    </th>
                  ) )}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Nenhum personagem encontrado</td></tr>
                )}
                {rows.map( ( player ) => {
                  const cls = getClassName( player.class )
                  const subCls = getClassName( player.subClass )
                  return (
                    <tr key={`${player.charName}-${player._origRank}`} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 w-10"><RankBadge rank={player._origRank} /></td>
                      <td className="px-3 py-3 font-medium">{player.charName}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={cn( 'text-[10px] px-2 py-0 h-5', CLASS_BADGE_VARIANT[ cls ] )}>
                            {cls}
                          </Badge>
                          <Badge variant="outline" className={cn( 'text-[10px] px-2 py-0 h-5', CLASS_BADGE_VARIANT[ subCls ] )}>
                            {subCls}
                          </Badge>
                        </div>
                      </td>
                      <td className={cn( 'px-3 py-3 font-medium tabular-nums', player.points > 0 ? 'text-violet-600' : player.points < 0 ? 'text-destructive' : '' )}>
                        {player.points > 0 ? `+${player.points}` : player.points}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{player.wins}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{player.kills}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{player.deaths}</td>
                    </tr>
                  )
                } )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-muted-foreground text-right">
          {rows.length} jogador{rows.length !== 1 ? 'es' : ''} exibido{rows.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}