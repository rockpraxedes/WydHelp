import { useEffect, useState } from "react";

export function RelogioBrasilia() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    function atualizarHora() {
      const agora = new Date();

      const horaBrasilia = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(agora);

      setHora(horaBrasilia);
    }

    atualizarHora();
    const interval = setInterval(atualizarHora, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">Horário de Brasília</span>
      <span className="font-mono text-lg font-semibold">{hora}</span>
    </div>
  );
}
