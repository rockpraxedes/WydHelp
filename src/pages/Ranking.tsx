// src/pages/Ranking.tsx

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrophyIcon, UserIcon, ArrowUpDownIcon, ArrowDownIcon, ArrowUpIcon, SwordIcon, ShieldIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

const SHOW_ARENA = false;

const API_URL = process.env.NODE_ENV === 'development'
  ? '/api/royal-arena'
  : '/ranking.json'

const HISTORY_URL = '/arena-history.json'

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
  TK: 'bg-blue-900/30 text-blue-300 border-blue-700',
  HT: 'bg-amber-900/30 text-amber-300 border-amber-700',
  FM: 'bg-violet-900/30 text-violet-300 border-violet-700',
  BM: 'bg-emerald-900/30 text-emerald-300 border-emerald-700',
}

interface Player {
  charName: string
  class: number
  subClass: number
  wins: number
  kills: number
  deaths: number
  points: number
  bonusKill: number
  total: number
  displayRank: number
}

interface ArenaEntry {
  timestamp: string
  arenaLabel: string
  type: 'champion' | 'aspirant'
  winners: string[]
  mostKills: { name: string | string[]; kills: number }
  leastDeaths: { name: string | string[]; deaths: number }
}

type SortKey = 'rank' | 'charName' | 'class' | 'points' | 'wins' | 'kills' | 'deaths' | 'bonusKill' | 'total'
type SortDir = 'asc' | 'desc'
type TabType = 'champion' | 'aspirant'

interface SortState { key: SortKey; dir: SortDir }

function SortIcon( { col, sort }: { col: SortKey; sort: SortState } ) {
  if ( sort.key !== col ) return <ArrowUpDownIcon className="w-3 h-3 opacity-40" />
  return sort.dir === 'desc'
    ? <ArrowDownIcon className="w-3 h-3 text-violet-500" />
    : <ArrowUpIcon className="w-3 h-3 text-violet-500" />
}

function ArenaHistoryCard( { entry, compact }: { entry: ArenaEntry; compact?: boolean } ) {
  const [ isExpanded, setIsExpanded ] = useState( false );
  const [ showAllKills, setShowAllKills ] = useState( false );
  const [ showAllDeaths, setShowAllDeaths ] = useState( false );

  const renderHighlightNames = ( names: string | string[], isExpanded: boolean, setExpanded: ( v: boolean ) => void ) => {
    const nameArray = Array.isArray( names ) ? names : [ names ];
    const hasMultiple = nameArray.length > 1;

    return (
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-xs font-bold text-white leading-tight",
          !isExpanded && "truncate"
        )}>
          {isExpanded ? nameArray.join( ', ' ) : nameArray[ 0 ]}
        </p>
        {hasMultiple && (
          <button
            onClick={() => setExpanded( !isExpanded )}
            className="text-[8px] text-violet-400 hover:text-violet-300 font-black uppercase mt-1 block"
          >
            {isExpanded ? 'Recolher' : `+${nameArray.length - 1} outros`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "rounded-xl border transition-all overflow-hidden",
      compact
        ? "bg-gradient-to-r from-violet-900/20 to-black/40 border-violet-500/30 p-4 shadow-lg shadow-violet-500/5"
        : "bg-black/40 border-white/5 p-4"
    )}>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="shrink-0 text-center sm:text-left sm:border-r sm:border-white/10 sm:pr-4">
          <p className="text-[12px] font-black text-white leading-none">VENCEDORES</p>
          <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest leading-none mb-1">Arena das</p>
          <p className="text-2xl font-black text-white leading-none">{entry.arenaLabel}</p>
        </div>

        <div className="flex flex-1 gap-2 w-full">
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-2">
            <SwordIcon className="w-3 h-3 text-rose-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-rose-500/70 font-bold uppercase leading-none mb-1">Kills</p>
              {renderHighlightNames( entry.mostKills.name, showAllKills, setShowAllKills )}
              <p className="text-[9px] text-muted-foreground font-bold mt-1">{entry.mostKills.kills} Kills</p>
            </div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-2">
            <ShieldIcon className="w-3 h-3 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-emerald-500/70 font-bold uppercase leading-none mb-1">Deaths</p>
              {renderHighlightNames( entry.leastDeaths.name, showAllDeaths, setShowAllDeaths )}
              <p className="text-[9px] text-muted-foreground font-bold mt-1">{entry.leastDeaths.deaths} Mortes</p>
            </div>
          </div>
        </div>

        <div className="w-full sm:min-w-[180px] sm:w-auto flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
              Vencedores ({entry.winners.length})
            </p>
            <button
              onClick={() => setIsExpanded( !isExpanded )}
              className="flex items-center gap-1 text-[9px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-tighter"
            >
              {isExpanded ? 'Recolher' : 'Ver todos'}
              {isExpanded ? <ChevronUpIcon className="w-2.5 h-2.5" /> : <ChevronDownIcon className="w-2.5 h-2.5" />}
            </button>
          </div>

          <div
            className={cn(
              "flex flex-wrap gap-1 transition-all duration-300",
              !isExpanded ? "max-h-[40px] overflow-hidden" : "max-h-none"
            )}
          >
            {entry.winners.map( ( name, i ) => (
              <span
                key={i}
                className="text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
              >
                {name}
              </span>
            ) )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Ranking() {
  const [ data, setData ] = useState<{ champion: Player[]; aspirant: Player[] } | null>( null )
  const [ history, setHistory ] = useState<ArenaEntry[]>( [] )
  const [ loading, setLoading ] = useState( true )
  const [ error, setError ] = useState<string | null>( null )
  const [ tab, setTab ] = useState<TabType>( 'champion' )
  const [ search, setSearch ] = useState( '' )
  const [ sort, setSort ] = useState<SortState>( { key: 'total', dir: 'desc' } )
  const [ showHistory, setShowHistory ] = useState( false )

  useEffect( () => {
    Promise.all( [
      fetch( API_URL ).then( r => r.ok ? r.json() : null ),
      fetch( HISTORY_URL ).then( r => r.ok ? r.json() : [] )
    ] )
      .then( ( [ rankingData, historyData ] ) => {
        if ( rankingData ) setData( rankingData )
        else setError( 'Não foi possível carregar o ranking.' )
        setHistory( Array.isArray( historyData ) ? historyData : [] )
      } )
      .catch( () => setError( 'Erro de conexão com o servidor.' ) )
      .finally( () => setLoading( false ) )
  }, [] )

  const filteredHistory = useMemo( () => {
    return history.filter( entry => entry.type === tab )
  }, [ history, tab ] )

  const rows = useMemo( () => {
    if ( !data ) return []

    const listWithCalculations = ( data[ tab ] ?? [] ).map( ( p ) => {
      const bonusKill = Math.floor( ( p.kills ?? 0 ) * 0.10 )
      const total = ( p.points ?? 0 ) + bonusKill
      return { ...p, bonusKill, total }
    } )

    const sortedList = [ ...listWithCalculations ].sort( ( a, b ) => {
      const mul = sort.dir === 'desc' ? -1 : 1
      if ( sort.key === 'total' || sort.key === 'points' ) {
        if ( a.total !== b.total ) return ( a.total - b.total ) * mul
        return ( a.wins - b.wins ) * mul
      }
      if ( sort.key === 'charName' ) return a.charName.localeCompare( b.charName ) * mul
      const valA = ( a[ sort.key as keyof Player ] as number ) ?? 0
      const valB = ( b[ sort.key as keyof Player ] as number ) ?? 0
      return ( valA - valB ) * mul
    } )

    const listWithRank = sortedList.map( ( p, i ) => ( {
      ...p,
      displayRank: i + 1
    } ) )

    // Lógica de busca multi-termo
    if ( !search.trim() ) return listWithRank;

    // Criamos um array de termos usando os separadores: , / && & |
    const searchTerms = search
      .split( /,|\/|&&|&|\|/ )
      .map( t => t.trim().toLowerCase() )
      .filter( t => t.length > 0 );

    return listWithRank.filter( p => {
      const name = p.charName.toLowerCase();
      // Retorna true se o nome incluir QUALQUER um dos termos digitados
      return searchTerms.some( term => name.includes( term ) );
    } );

  }, [ data, tab, search, sort ] )

  const TABS = [
    { id: 'champion' as TabType, label: 'Champion', Icon: TrophyIcon },
    { id: 'aspirant' as TabType, label: 'Aspirant', Icon: UserIcon },
  ]

  const COLS: { key: SortKey; label: string }[] = [
    { key: 'rank', label: 'RANK' },
    { key: 'charName', label: 'PERSONAGEM' },
    { key: 'class', label: 'CLASSE' },
    { key: 'wins', label: 'WINS' },
    { key: 'kills', label: 'KILLS' },
    { key: 'deaths', label: 'DEATHS' },
    { key: 'points', label: 'CS' },
    { key: 'bonusKill', label: 'BONUS KILL' },
    { key: 'total', label: 'TOTAL' },
  ]

  const latestArena = filteredHistory.length > 0 ? filteredHistory[ 0 ] : null
  const olderHistory = filteredHistory.length > 1 ? filteredHistory.slice( 1 ) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
        <div className="w-full lg:max-w-sm space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Char1 , Char2 / Char3"
              value={search}
              onChange={e => setSearch( e.target.value )}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none focus:border-violet-500 transition-all text-white placeholder:text-muted-foreground/50 shadow-inner"
            />
          </div>

          <nav className="flex items-center gap-6 border-b border-white/5">
            {TABS.map( ( { id, label, Icon } ) => (
              <button
                key={id}
                onClick={() => { setTab( id ); setShowHistory( false ); }}
                className={cn(
                  'flex items-center gap-2 px-1 py-3 text-sm transition-all border-b-2 -mb-px font-bold tracking-tight',
                  tab === id
                    ? 'border-violet-500 text-violet-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ) )}
          </nav>
        </div>

        <div className="w-full lg:flex-1 max-w-2xl">
          {SHOW_ARENA && latestArena && (
            <div className="relative group">
              <ArenaHistoryCard entry={latestArena} compact={true} />
              {olderHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory( v => !v )}
                  className="absolute -bottom-6 right-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-violet-400 transition-colors bg-black/40 px-2 py-0.5 rounded border border-white/5"
                >
                  {showHistory ? `[ Ocultar Arenas ${tab} ]` : `[ +${olderHistory.length} Arenas ${tab} ]`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {SHOW_ARENA && showHistory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {olderHistory.map( ( entry, i ) => (
            <ArenaHistoryCard key={i} entry={entry} />
          ) )}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden shadow-2xl">
        {loading && <p className="py-20 text-center text-sm text-muted-foreground animate-pulse">Sincronizando ranking...</p>}
        {error && <p className="py-20 text-center text-sm text-destructive font-medium">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {COLS.map( col => (
                    <th
                      key={col.key}
                      onClick={() => setSort( p => ( { key: col.key, dir: p.key === col.key && p.dir === 'desc' ? 'asc' : 'desc' } ) )}
                      className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon col={col.key} sort={sort} />
                      </span>
                    </th>
                  ) )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="py-20 text-center text-sm text-muted-foreground">Nenhum guerreiro encontrado.</td></tr>
                )}
                {rows.map( ( player ) => {
                  const cls = getClassName( player.class );
                  const subCls = getClassName( player.subClass );

                  return (
                    <tr key={player.charName} className="group hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-400">#{player.displayRank}</td>
                      <td className="px-4 py-4 font-bold text-slate-200">{player.charName}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={cn( 'text-[9px] px-1.5 py-0 h-5 font-black', CLASS_BADGE_VARIANT[ cls ] )}>{cls}</Badge>
                          <Badge variant="outline" className={cn( 'text-[9px] px-1.5 py-0 h-5 font-black', CLASS_BADGE_VARIANT[ subCls ] )}>{subCls}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 tabular-nums text-muted-foreground group-hover:text-slate-300">{player.wins}</td>
                      <td className="px-4 py-4 tabular-nums text-muted-foreground group-hover:text-slate-300">{player.kills}</td>
                      <td className="px-4 py-4 tabular-nums text-muted-foreground group-hover:text-slate-300">{player.deaths}</td>
                      <td className="px-4 py-4 tabular-nums text-slate-300">{player.points}</td>
                      <td className="px-4 py-4 tabular-nums text-slate-300">{player.bonusKill}</td>
                      <td className={cn( 'px-4 py-4 font-black tabular-nums', player.total > 0 ? 'text-violet-400' : 'text-slate-400' )}>
                        {player.total > 0 ? `+${player.total}` : player.total}
                      </td>
                    </tr>
                  );
                } )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}