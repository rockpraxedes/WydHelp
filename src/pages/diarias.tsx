import { useState } from "react";
import header from "../images/header.jpg";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Diarias() {
  const [enabled, setEnabled] = useState(false);
  const [extra1, setExtra1] = useState(false);
  const [extra2, setExtra2] = useState(false);

  function handleToggle(value: boolean) {
    setEnabled(value);

    // Se desligar o switch, desmarca os extras
    if (!value) {
      setExtra1(false);
      setExtra2(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 gap-10">
      {/* HEADER */}
      <div
        className="relative h-[200px] w-[700px] rounded-xl overflow-hidden"
        style={{
          backgroundImage: `url(${header})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* CARD */}
      <div className="w-[300px] rounded-xl border bg-card p-6 shadow-md space-y-6">
        {/* TÍTULO + SWITCH */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Diárias</h2>

          {/* TEXTO + SWITCH */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Evento TP
            </span>

            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              className="w-24 h-8"
            />
          </div>
        </div>

        {/* CHECKBOXES FIXOS */}
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3">
            <Checkbox /> Check-in
          </label>

          <label className="flex items-center gap-3">
            <Checkbox /> Espólios
          </label>

          <label className="flex items-center gap-3">
            <Checkbox /> Expedição
          </label>

          <label className="flex items-center gap-3">
            <Checkbox /> Deserto Desconhecido
          </label>

          <label className="flex items-center gap-3">
            <Checkbox /> Portão Infernal
          </label>

          {/* CHECKBOXES EXTRAS (SÓ QUANDO ON) */}
          <div
            className={`
    overflow-hidden transition-all duration-400 ease-out
    ${enabled ? "max-h-40 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}
  `}
          >
            <div className="flex flex-col gap-4 pt-2">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={extra1}
                  onCheckedChange={(v) => setExtra1(!!v)}
                />
                Missão Especial
              </label>

              <label className="flex items-center gap-3">
                <Checkbox
                  checked={extra2}
                  onCheckedChange={(v) => setExtra2(!!v)}
                />
                Evento Diário
              </label>
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4 pt-4">
          <Button className="flex-1">Atualizar</Button>

          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setEnabled(false);
              setExtra1(false);
              setExtra2(false);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
