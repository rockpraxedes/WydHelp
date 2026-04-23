import { useServerStatus } from "@/hooks/useServerStatus";
import { getSpecialServer } from "@/lib/getSpecialServer";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServerStatusWidget() {
  const { channels, loading, error, refetch } = useServerStatus();
  const specialServer = getSpecialServer();

  const slots = loading
    ? Array.from({ length: 6 }, (_, i) => ({
        name: `Server ${i + 1}`,
        players: 0,
      }))
    : channels.map((s, i) => ({ ...s, name: `Server ${i + 1}` }));

  function getPlayerColor(players: number) {
    if (players < 800) return "text-muted-foreground:";

    if (players >= 950) return "text-red-500";

    // gradiente entre 800 e 950
    const ratio = (players - 800) / (950 - 800);

    // interpolação simples (laranja -> vermelho)
    const r = 255;
    const g = Math.round(165 - 165 * ratio); // 165 -> 0
    const b = 0;

    return `text-[rgb(${r},${g},${b})]`;
  }

  return (
    <div className="flex items-center gap-1 pb-1">
      {slots.map((s, i) => (
        <div
          key={i}
          title={`${s.name}: ${s.players} jogadores${i + 1 === specialServer ? " - Server Novato" : ""}`}
          className={cn(
            "flex flex-col items-center justify-center rounded-md",
            "border transition-all",
            i + 1 === specialServer
              ? "border-green-400/50 bg-green-500/10"
              : "border-violet-500/40 bg-violet-500/10",
            loading && "animate-pulse",
          )}
          style={{ width: 44, height: 30, gap: 2 }}
        >
          <span
            className={cn(
              "text-[9px] leading-none",
              i + 1 === specialServer
                ? "text-green-400 font-semibold"
                : "text-violet-400",
            )}
          >
            {s.name}
          </span>
          <span
            className={cn(
              "text-[11px] font-bold leading-none",
              getPlayerColor(s.players),
            )}
          >
            {loading ? "·" : s.players}
          </span>
        </div>
      ))}

      {error && <span className="text-[10px] text-red-400 ml-1">offline</span>}
    </div>
  );
}
