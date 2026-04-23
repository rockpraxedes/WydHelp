// src/pages/Ranking.tsx

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrophyIcon,
  UserIcon,
  ArrowUpDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  SwordIcon,
  ShieldIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ScrollTextIcon,
  XIcon,
  ClockIcon,
  BarChart2Icon,
} from "lucide-react";

const SHOW_ARENA = true;

const API_URL =
  process.env.NODE_ENV === "development" ? "/api/royal-arena" : "/ranking.json";

const SNAPSHOTS_URL = "/ranking-snapshots.json";

const GERAL_API_URL =
  "https://rn3xfhamppsetddkod6vwc24lu0lhcek.lambda-url.us-east-1.on.aws/component-rank";

const CLASS_MAP: Record<string, string> = {
  "0": "TK",
  "1": "FM",
  "2": "BM",
  "3": "HT",
};

function getClassName(classId: number) {
  return CLASS_MAP[String(classId)] ?? "?";
}

const CLASS_BADGE_VARIANT: Record<string, string> = {
  TK: "bg-blue-900/30 text-blue-300 border-blue-700",
  HT: "bg-amber-900/30 text-amber-300 border-amber-700",
  FM: "bg-violet-900/30 text-violet-300 border-violet-700",
  BM: "bg-emerald-900/30 text-emerald-300 border-emerald-700",
};

const KINGDOM_STYLE: Record<string, { label: string; className: string }> = {
  blue: {
    label: "Azul",
    className: "bg-blue-900/30 text-blue-300 border-blue-700/50",
  },
  red: {
    label: "Vermelho",
    className: "bg-rose-900/30 text-rose-300 border-rose-700/50",
  },
  none: {
    label: "Neutro",
    className: "bg-slate-800/50 text-slate-400 border-slate-700/50",
  },
};

function getKingdom(k: string) {
  return KINGDOM_STYLE[k] ?? KINGDOM_STYLE["none"];
}

const BADGE_REWARDS: { level: number; reward: string }[] = [
  { level: 1, reward: "[05] Poção Mental" },
  { level: 2, reward: "[20] Joia da sagacidade" },
  { level: 3, reward: "[20] Joia da Absorção" },
  { level: 4, reward: "[01] Poção divina 7 dias" },
  { level: 5, reward: "[01] Frango Assado" },
  { level: 6, reward: "[10] Baú de EXP" },
  { level: 7, reward: "[01] Barra de Prata (100kk)" },
  { level: 8, reward: "[10] Fragmento de Alma" },
  { level: 9, reward: "[30] Cristal de Amunra" },
  { level: 10, reward: "[04] Poeira de Lac 100" },
  { level: 11, reward: "[04] Entrada Zona Infernal" },
  { level: 12, reward: "[30] Cristal de Bahamut" },
  { level: 13, reward: "[01] Proteção Divina" },
  { level: 14, reward: "[10] Soul Fragment" },
  { level: 15, reward: "[03] Barra de Prata (100kk)" },
  { level: 16, reward: "[01] Bahamut's Blood" },
  { level: 17, reward: "[01] Valkyrie Emblem +0" },
  { level: 18, reward: "[02] Ovo azul" },
  { level: 19, reward: "[20] Bahamut Tear (Happiness)" },
  { level: 20, reward: "[01] Cursed hat (Black)" },
  { level: 21, reward: "[120] Âmago de Dragão +7" },
  { level: 22, reward: "[05] Bahamut tear (rage)" },
  { level: 23, reward: "[30] RedDragon Scale" },
  { level: 24, reward: "[01] Cursed hat (Black)" },
];

type TabType = "geral" | "champion" | "aspirant";

const RANKING_REWARDS: Record<
  Exclude<TabType, "geral">,
  { range: string; reward: string }[]
> = {
  aspirant: [
    {
      range: "1º",
      reward: "[15] Aspirant Treasure · [100] Royal Arena Coupon",
    },
    {
      range: "2º",
      reward: "[10] Aspirant Treasure · [100] Royal Arena Coupon",
    },
    { range: "3º", reward: "[10] Aspirant Treasure · [75] Royal Arena Coupon" },
    {
      range: "4º ~ 10º",
      reward: "[05] Aspirant Treasure · [50] Royal Arena Coupon",
    },
    {
      range: "11º ~ 26º",
      reward: "[03] Aspirant Treasure · [35] Royal Arena Coupon",
    },
    {
      range: "27º ~ 52º",
      reward: "[01] Aspirant Treasure · [25] Royal Arena Coupon",
    },
  ],
  champion: [
    {
      range: "1º",
      reward:
        "[15] Champion Treasure · [100] Royal Arena Coupon · [01] Conjunto Champion ([01] Odin Lendário + [01] Skin White Fenrir)",
    },
    {
      range: "2º",
      reward:
        "[10] Champion Treasure · [100] Royal Arena Coupon · [01] Skin Black Fenrir",
    },
    { range: "3º", reward: "[10] Champion Treasure · [75] Royal Arena Coupon" },
    {
      range: "4º ~ 10º",
      reward: "[05] Champion Treasure · [50] Royal Arena Coupon",
    },
    {
      range: "11º ~ 26º",
      reward: "[03] Champion Treasure · [35] Royal Arena Coupon",
    },
    {
      range: "27º ~ 52º",
      reward: "[01] Champion Treasure · [25] Royal Arena Coupon",
    },
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawPlayer {
  charName: string;
  class: number;
  subClass: number;
  wins: number;
  kills: number;
  deaths: number;
  points: number;
}

interface Player extends RawPlayer {
  bonusKill: number;
  total: number;
  displayRank: number;
}

interface GeralPlayer {
  name: string;
  level: number;
  levelSub: number;
  "Soma Level": number;
  kingdom: string;
  guild: number;
  guildMark: string;
  subClass: number;
  points: number;
}

interface GeralRow extends GeralPlayer {
  displayRank: number;
}

interface RankingSnapshot {
  timestamp: string;
  slotLabel: string;
  date: string;
  champion: RawPlayer[];
  aspirant: RawPlayer[];
}

interface ArenaEntry {
  timestamp: string;
  arenaLabel: string;
  date: string;
  type: Exclude<TabType, "geral">;
  winners: string[];
  mostKills: { name: string[]; kills: number };
  leastDeaths: { name: string[]; deaths: number };
}

type SortKey =
  | "rank"
  | "charName"
  | "class"
  | "points"
  | "wins"
  | "kills"
  | "deaths"
  | "bonusKill"
  | "total";
type GeralSortKey =
  | "rank"
  | "name"
  | "level"
  | "levelSub"
  | "somaLevel"
  | "kingdom";
type SortDir = "asc" | "desc";
type SortableKey = Exclude<SortKey, "rank">;

interface SortState {
  key: SortKey;
  dir: SortDir;
}
interface GeralSortState {
  key: GeralSortKey;
  dir: SortDir;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPlayerMap(list: RawPlayer[]): Record<string, RawPlayer> {
  const m: Record<string, RawPlayer> = {};
  for (const p of list) m[p.charName] = p;
  return m;
}

function computeArenaEntry(
  curr: RankingSnapshot,
  prev: RankingSnapshot,
  type: Exclude<TabType, "geral">,
): ArenaEntry {
  const currList = curr[type] ?? [];
  const prevMap = buildPlayerMap(prev[type] ?? []);

  interface Diff {
    charName: string;
    winsDiff: number;
    killsDiff: number;
    deathsDiff: number;
  }

  const diffs: Diff[] = currList
    .map((p) => {
      const old = prevMap[p.charName];
      return {
        charName: p.charName,
        winsDiff: p.wins - (old?.wins ?? 0),
        killsDiff: p.kills - (old?.kills ?? 0),
        deathsDiff: p.deaths - (old?.deaths ?? 0),
      };
    })
    .filter((d) => d.winsDiff > 0);

  const winners = [...diffs]
    .sort((a, b) => b.winsDiff - a.winsDiff || b.killsDiff - a.killsDiff)
    .map((d) => d.charName);

  const maxKills = diffs.reduce((max, d) => Math.max(max, d.killsDiff), 0);
  const topKillers = diffs.filter((d) => d.killsDiff === maxKills);

  const minDeaths = diffs.reduce(
    (min, d) => Math.min(min, d.deathsDiff),
    Infinity,
  );
  const leastDeadPlayers = diffs.filter((d) => d.deathsDiff === minDeaths);

  return {
    timestamp: curr.timestamp,
    arenaLabel: curr.slotLabel,
    date: curr.date,
    type,
    winners,
    mostKills: {
      name: topKillers.map((d) => d.charName),
      kills: maxKills,
    },
    leastDeaths: {
      name: leastDeadPlayers.map((d) => d.charName),
      deaths: minDeaths === Infinity ? 0 : minDeaths,
    },
  };
}

function snapshotsToArenaEntries(
  snapshots: RankingSnapshot[],
  type: Exclude<TabType, "geral">,
): ArenaEntry[] {
  if (snapshots.length < 2) return [];
  const entries: ArenaEntry[] = [];
  for (let i = snapshots.length - 1; i >= 1; i--) {
    entries.push(computeArenaEntry(snapshots[i], snapshots[i - 1], type));
  }
  return entries;
}

function formatDate(date: string): string {
  return date.split("-").reverse().join("/");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({ col, sort }: { col: SortKey; sort: SortState }) {
  if (sort.key !== col)
    return <ArrowUpDownIcon className="w-3 h-3 opacity-40" />;
  return sort.dir === "desc" ? (
    <ArrowDownIcon className="w-3 h-3 text-violet-500" />
  ) : (
    <ArrowUpIcon className="w-3 h-3 text-violet-500" />
  );
}

function GeralSortIcon({
  col,
  sort,
}: {
  col: GeralSortKey;
  sort: GeralSortState;
}) {
  if (sort.key !== col)
    return <ArrowUpDownIcon className="w-3 h-3 opacity-40" />;
  return sort.dir === "desc" ? (
    <ArrowDownIcon className="w-3 h-3 text-violet-500" />
  ) : (
    <ArrowUpIcon className="w-3 h-3 text-violet-500" />
  );
}

function ArenaHistoryCard({
  entry,
  compact,
}: {
  entry: ArenaEntry;
  compact?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllKills, setShowAllKills] = useState(false);
  const [showAllDeaths, setShowAllDeaths] = useState(false);

  const renderHighlightNames = (
    names: string[],
    isExpanded: boolean,
    setExpanded: (v: boolean) => void,
  ) => {
    const hasMultiple = names.length > 1;
    return (
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-xs font-bold text-white leading-tight",
            !isExpanded && "truncate",
          )}
        >
          {isExpanded ? names.join(", ") : names[0]}
        </p>
        {hasMultiple && (
          <button
            onClick={() => setExpanded(!isExpanded)}
            className="text-[8px] text-violet-400 hover:text-violet-300 font-black uppercase mt-1 block"
          >
            {isExpanded ? "Recolher" : `+${names.length - 1} outros`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all overflow-visible",
        compact
          ? "bg-gradient-to-r from-violet-900/20 to-black/40 border-violet-500/30 p-4 shadow-lg shadow-violet-500/5"
          : "bg-black/40 border-white/5 p-4",
      )}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="shrink-0 text-center sm:text-left sm:border-r sm:border-white/10 sm:pr-4">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[12px] font-black text-white leading-none">
              VENCEDORES
            </p>
            <div className="absolute -top-2 left-2 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 leading-none">
                Fase de Testes
              </span>
            </div>
          </div>
          <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest leading-none mb-1">
            Arena das
          </p>
          <p className="text-2xl font-black text-white leading-none">
            {entry.arenaLabel}
          </p>
          <p className="text-[10px] text-slate-500 font-bold tabular-nums mt-1">
            {formatDate(entry.date)}
          </p>
        </div>

        <div className="flex flex-1 gap-2 w-full">
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-2">
            <SwordIcon className="w-3 h-3 text-rose-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-rose-500/70 font-bold uppercase leading-none mb-1">
                Kills
              </p>
              {renderHighlightNames(
                entry.mostKills.name,
                showAllKills,
                setShowAllKills,
              )}
              <p className="text-[9px] text-muted-foreground font-bold mt-1">
                {entry.mostKills.kills} Kills
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-2">
            <ShieldIcon className="w-3 h-3 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-emerald-500/70 font-bold uppercase leading-none mb-1">
                Deaths
              </p>
              {renderHighlightNames(
                entry.leastDeaths.name,
                showAllDeaths,
                setShowAllDeaths,
              )}
              <p className="text-[9px] text-muted-foreground font-bold mt-1">
                {entry.leastDeaths.deaths} Mortes
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:min-w-[180px] sm:w-auto flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
              Vencedores ({entry.winners.length})
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[9px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-tighter"
            >
              {isExpanded ? "Recolher" : "Ver todos"}
              {isExpanded ? (
                <ChevronUpIcon className="w-2.5 h-2.5" />
              ) : (
                <ChevronDownIcon className="w-2.5 h-2.5" />
              )}
            </button>
          </div>
          <div
            className={cn(
              "flex flex-wrap gap-1 transition-all duration-300",
              !isExpanded ? "max-h-[40px] overflow-hidden" : "max-h-none",
            )}
          >
            {entry.winners.map((name, i) => (
              <span
                key={i}
                className="text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArenaHistoryModal({
  entries,
  tab,
  onClose,
}: {
  entries: ArenaEntry[];
  tab: Exclude<TabType, "geral">;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl shadow-violet-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d0d14] rounded-t-2xl shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">
              {tab === "champion" ? "Champions Hall" : "Aspirants Field"}
            </p>
            <h2 className="text-lg font-black text-white leading-tight flex items-center gap-2">
              <ScrollTextIcon className="w-4 h-4 text-violet-400" />
              Histórico de Arenas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {entries.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum histórico disponível.
            </p>
          )}
          {entries.map((entry, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-3"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-3 h-3 text-violet-400 shrink-0" />
                  <span className="text-[11px] font-black text-white">
                    {entry.arenaLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums font-bold">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  {entry.winners.length} vencedor
                  {entry.winners.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div className="flex gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 bg-rose-500/5 border border-rose-500/10 rounded-lg px-2 py-1 flex-1 min-w-0">
                  <SwordIcon className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] text-rose-500/60 font-bold uppercase leading-none">
                      Top Kills
                    </p>
                    <p className="text-[10px] font-bold text-white truncate leading-tight mt-0.5">
                      {entry.mostKills.name.join(", ") || "-"}
                      <span className="text-rose-400 ml-1">
                        ({entry.mostKills.kills})
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-2 py-1 flex-1 min-w-0">
                  <ShieldIcon className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] text-emerald-500/60 font-bold uppercase leading-none">
                      Menos Mortes
                    </p>
                    <p className="text-[10px] font-bold text-white truncate leading-tight mt-0.5">
                      {entry.leastDeaths.name.join(", ") || "-"}
                      <span className="text-emerald-400 ml-1">
                        ({entry.leastDeaths.deaths})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.winners.map((name, j) => (
                  <span
                    key={j}
                    className="text-[9px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RewardsModal({
  tab,
  onClose,
}: {
  tab: Exclude<TabType, "geral">;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl shadow-violet-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d0d14]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">
              {tab === "champion" ? "Champions Hall" : "Aspirants Field"}
            </p>
            <h2 className="text-lg font-black text-white leading-tight">
              Premiação
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
              Ranking Royal Arena
            </p>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">
                      Ranking
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Recompensa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RANKING_REWARDS[tab].map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "transition-colors",
                        i === 0
                          ? "bg-amber-500/5 hover:bg-amber-500/10"
                          : i === 1
                            ? "bg-slate-400/5 hover:bg-slate-400/10"
                            : i === 2
                              ? "bg-orange-800/5 hover:bg-orange-800/10"
                              : "hover:bg-white/[0.03]",
                      )}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-black",
                            i === 0
                              ? "text-amber-400"
                              : i === 1
                                ? "text-slate-300"
                                : i === 2
                                  ? "text-orange-600"
                                  : "text-muted-foreground",
                          )}
                        >
                          {row.range}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300 leading-relaxed">
                        {row.reward}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
              Recompensas por Badge
            </p>
            <p className="text-[11px] text-muted-foreground/60 mb-3">
              Cada nível de badge requer pelo menos{" "}
              <span className="text-violet-400 font-bold">[03] XP</span>{" "}
              acumulados.
            </p>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground w-28">
                      Badge
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Recompensa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {BADGE_REWARDS.map((row) => (
                    <tr
                      key={row.level}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-violet-900/30 text-violet-300 border border-violet-700/50 px-2 py-0.5 rounded-full">
                          Lvl {row.level}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-300">
                        {row.reward}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

export function Ranking() {
  const [data, setData] = useState<{
    champion: RawPlayer[];
    aspirant: RawPlayer[];
  } | null>(null);
  const [geralData, setGeralData] = useState<GeralPlayer[]>([]);
  const [snapshots, setSnapshots] = useState<RankingSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [geralLoading, setGeralLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("geral");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "total", dir: "desc" });
  const [geralSort, setGeralSort] = useState<GeralSortState>({
    key: "somaLevel",
    dir: "desc",
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  // Fetch arena ranking (champion / aspirant)
  useEffect(() => {
    Promise.all([
      fetch(API_URL)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(SNAPSHOTS_URL)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([rankingData, snapshotData]) => {
        if (rankingData) setData(rankingData);
        else setError("Não foi possível carregar o ranking.");
        setSnapshots(Array.isArray(snapshotData) ? snapshotData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch ranking geral (level)
  useEffect(() => {
    fetch(GERAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: GeralPlayer[]) => setGeralData(Array.isArray(d) ? d : []))
      .catch(() => setGeralData([]))
      .finally(() => setGeralLoading(false));
  }, []);

  const filteredHistory = useMemo(() => {
    if (tab === "geral") return [];
    return snapshotsToArenaEntries(snapshots, tab).filter(
      (entry) => entry.winners.length > 0,
    );
  }, [snapshots, tab]);

  // Arena rows (champion / aspirant)
  const rows = useMemo(() => {
    if (!data || tab === "geral") return [];

    const listWithCalculations = (
      data[tab as "champion" | "aspirant"] ?? []
    ).map((p) => {
      const bonusKill = Math.floor((p.kills ?? 0) * 0.1);
      const total = (p.points ?? 0) + bonusKill;
      return { ...p, bonusKill, total };
    });

    const sortedList = [...listWithCalculations].sort((a, b) => {
      const mul = sort.dir === "desc" ? -1 : 1;
      if (sort.key === "total" || sort.key === "points") {
        if (a.total !== b.total) return (a.total - b.total) * mul;
        return (a.wins - b.wins) * mul;
      }
      if (sort.key === "charName")
        return a.charName.localeCompare(b.charName) * mul;
      if (sort.key === "rank") return 0;
      const key = sort.key as SortableKey;
      return (((a[key] as number) ?? 0) - ((b[key] as number) ?? 0)) * mul;
    });

    const listWithRank = sortedList.map((p, i) => ({
      ...p,
      displayRank: i + 1,
    }));

    if (!search.trim()) return listWithRank;

    const searchTerms = search
      .split(/,|\/|&&|&|\|/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    return listWithRank.filter((p) => {
      const name = p.charName.toLowerCase();
      return searchTerms.some((term) => name.includes(term));
    });
  }, [data, tab, search, sort]);

  // Geral rows
  const geralRows = useMemo((): GeralRow[] => {
    const sorted = [...geralData].sort((a, b) => {
      const mul = geralSort.dir === "desc" ? -1 : 1;
      switch (geralSort.key) {
        case "name":
          return a.name.localeCompare(b.name) * mul;
        case "level":
          return (a.level - b.level) * mul;
        case "levelSub":
          return (a.levelSub - b.levelSub) * mul;
        case "kingdom":
          return a.kingdom.localeCompare(b.kingdom) * mul;
        case "somaLevel":
        default:
          return (a["Soma Level"] - b["Soma Level"]) * mul;
      }
    });

    const withRank = sorted.map((p, i) => ({ ...p, displayRank: i + 1 }));

    if (!search.trim()) return withRank;

    const searchTerms = search
      .split(/,|\/|&&|&|\|/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    return withRank.filter((p) =>
      searchTerms.some((term) => p.name.toLowerCase().includes(term)),
    );
  }, [geralData, geralSort, search]);

  const TABS: { id: TabType; label: string; Icon: React.ElementType }[] = [
    { id: "geral", label: "Geral", Icon: BarChart2Icon },
    { id: "champion", label: "Champion", Icon: TrophyIcon },
    { id: "aspirant", label: "Aspirant", Icon: UserIcon },
  ];

  const ARENA_COLS: { key: SortKey; label: string }[] = [
    { key: "rank", label: "RANK" },
    { key: "charName", label: "PERSONAGEM" },
    { key: "class", label: "CLASSE" },
    { key: "wins", label: "WINS" },
    { key: "kills", label: "KILLS" },
    { key: "deaths", label: "DEATHS" },
    { key: "points", label: "CS" },
    { key: "bonusKill", label: "BONUS KILL" },
    { key: "total", label: "TOTAL" },
  ];

  const GERAL_COLS: { key: GeralSortKey; label: string }[] = [
    { key: "rank", label: "RANK" },
    { key: "name", label: "PERSONAGEM" },
    { key: "level", label: "LVL" },
    { key: "levelSub", label: "LVL SUB" },
    { key: "somaLevel", label: "TOTAL" },
    { key: "kingdom", label: "REINO" },
  ];

  const latestArena = filteredHistory.length > 0 ? filteredHistory[0] : null;
  const olderHistory =
    filteredHistory.length > 1 ? filteredHistory.slice(1) : [];

  const isArenaTab = tab === "champion" || tab === "aspirant";

  return (
    <div className="space-y-8">
      {/* ── Top bar: search + premiação + tabs ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
        {/* Left: search + tabs */}
        <div className="w-full lg:max-w-sm space-y-4">
          {/* Search + Premiação */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ex: Char1 , Char2 / Char3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none focus:border-violet-500 transition-all text-white placeholder:text-muted-foreground/50 shadow-inner"
              />
            </div>

            {/* Premiação – visível apenas nas abas de arena */}
            {isArenaTab && (
              <button
                onClick={() => setShowRewards(true)}
                className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/50 bg-amber-500/5 hover:bg-amber-500/10 px-2.5 py-2 rounded-lg transition-all"
              >
                <TrophyIcon className="w-3 h-3" />
                Premiação
              </button>
            )}
          </div>

          {/* Tabs: Geral | Champion | Aspirant */}
          <div className="flex items-center gap-0 border-b border-white/5">
            <nav className="flex items-center gap-6">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id);
                    setShowHistoryModal(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-1 py-3 text-sm transition-all border-b-2 -mb-px font-bold tracking-tight",
                    tab === id
                      ? "border-violet-500 text-violet-500"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: arena history card */}
        <div className="w-full lg:flex-1 max-w-2xl">
          {SHOW_ARENA && isArenaTab && latestArena && (
            <div className="relative group">
              <ArenaHistoryCard entry={latestArena} compact={true} />
              {olderHistory.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="absolute -bottom-6 right-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-violet-400 transition-colors bg-black/40 px-2 py-0.5 rounded border border-white/5"
                >
                  [ +{olderHistory.length} Arenas {tab} ]
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden shadow-2xl">
        {/* ── GERAL TAB ── */}
        {tab === "geral" && (
          <>
            {geralLoading && (
              <p className="py-20 text-center text-sm text-muted-foreground animate-pulse">
                Carregando ranking geral...
              </p>
            )}
            {!geralLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {GERAL_COLS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() =>
                            setGeralSort((p) => ({
                              key: col.key,
                              dir:
                                p.key === col.key && p.dir === "desc"
                                  ? "asc"
                                  : "desc",
                            }))
                          }
                          className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            {col.label}
                            <GeralSortIcon col={col.key} sort={geralSort} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {geralRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-20 text-center text-sm text-muted-foreground"
                        >
                          Nenhum personagem encontrado.
                        </td>
                      </tr>
                    )}
                    {geralRows.map((player) => {
                      const kingdom = getKingdom(player.kingdom);
                      const isTop3 = player.displayRank <= 3;
                      return (
                        <tr
                          key={`${player.name}-${player.displayRank}`}
                          className="group hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "font-black tabular-nums",
                                player.displayRank === 1
                                  ? "text-amber-400"
                                  : player.displayRank === 2
                                    ? "text-slate-300"
                                    : player.displayRank === 3
                                      ? "text-orange-500"
                                      : "text-slate-500",
                              )}
                            >
                              #{player.displayRank}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3.5 font-bold",
                              isTop3 ? "text-white" : "text-slate-200",
                            )}
                          >
                            {player.name}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-slate-300 font-medium">
                            {player.level}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-slate-400 font-medium">
                            {player.levelSub}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3.5 font-black tabular-nums",
                              isTop3 ? "text-violet-400" : "text-slate-300",
                            )}
                          >
                            {player["Soma Level"]}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center text-[10px] font-bold border px-2 py-0.5 rounded-full",
                                kingdom.className,
                              )}
                            >
                              {kingdom.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── CHAMPION / ASPIRANT TABS ── */}
        {isArenaTab && (
          <>
            {loading && (
              <p className="py-20 text-center text-sm text-muted-foreground animate-pulse">
                Sincronizando ranking...
              </p>
            )}
            {error && (
              <p className="py-20 text-center text-sm text-destructive font-medium">
                {error}
              </p>
            )}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {ARENA_COLS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() =>
                            setSort((p) => ({
                              key: col.key,
                              dir:
                                p.key === col.key && p.dir === "desc"
                                  ? "asc"
                                  : "desc",
                            }))
                          }
                          className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            {col.label}
                            <SortIcon col={col.key} sort={sort} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-20 text-center text-sm text-muted-foreground"
                        >
                          Nenhum guerreiro encontrado.
                        </td>
                      </tr>
                    )}
                    {rows.map((player) => {
                      const cls = getClassName(player.class);
                      const subCls = getClassName(player.subClass);
                      return (
                        <tr
                          key={player.charName}
                          className="group hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-4 font-bold text-slate-400">
                            #{player.displayRank}
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-200">
                            {player.charName}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] px-1.5 py-0 h-5 font-black",
                                  CLASS_BADGE_VARIANT[cls],
                                )}
                              >
                                {cls}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] px-1.5 py-0 h-5 font-black",
                                  CLASS_BADGE_VARIANT[subCls],
                                )}
                              >
                                {subCls}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-4 tabular-nums text-muted-foreground group-hover:text-slate-300">
                            {player.wins}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-muted-foreground group-hover:text-slate-300">
                            {player.kills}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-muted-foreground group-hover:text-slate-300">
                            {player.deaths}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-slate-300">
                            {player.points}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-slate-300">
                            {player.bonusKill}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-4 font-black tabular-nums",
                              player.total > 0
                                ? "text-violet-400"
                                : "text-slate-400",
                            )}
                          >
                            {player.total > 0
                              ? `+${player.total}`
                              : player.total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showHistoryModal && isArenaTab && (
        <ArenaHistoryModal
          entries={filteredHistory}
          tab={tab as Exclude<TabType, "geral">}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
      {showRewards && isArenaTab && (
        <RewardsModal
          tab={tab as Exclude<TabType, "geral">}
          onClose={() => setShowRewards(false)}
        />
      )}
    </div>
  );
}
