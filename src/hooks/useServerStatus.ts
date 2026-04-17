// src/hooks/useServerStatus.ts
import { useEffect, useState } from "react";

export interface ServerChannel {
  name: string;
  players: number;
}

export function useServerStatus() {
  const [channels, setChannels] = useState<ServerChannel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchStatus() {
    try {
      const res = await fetch("https://wydglobal.pro/status.wyd");
      const data = await res.json();

      const list: ServerChannel[] = (data.channels as number[]).map(
        (players, i) => ({
          name: `S${i + 1}`,
          players,
        }),
      );

      setChannels(list);
      setTotal(list.reduce((acc, s) => acc + s.players, 0));
      setError(false);
    } catch (e) {
      console.error("Erro ao buscar status:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  return { channels, total, loading, error, refetch: fetchStatus };
}
