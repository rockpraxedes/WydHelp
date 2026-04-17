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
            className={cn("text-[11px] font-bold leading-none text-white/90")}
          >
            {loading ? "·" : s.players}
          </span>
        </div>
      ))}

      {error && <span className="text-[10px] text-red-400 ml-1">offline</span>}
    </div>
  );
}
