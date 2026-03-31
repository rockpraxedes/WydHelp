import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [accept, setAccept] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen p-8 max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">WYD Help</h1>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <div className="font-medium">Liga/Desliga</div>
          <div className="text-sm text-muted-foreground">
            Status: {enabled ? "Ligado" : "Desligado"}
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-2">
        <div className="font-medium">Caixa de texto (Input)</div>
        <Input
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="font-medium">Texto grande (Textarea)</div>
        <Textarea
          placeholder="Digite sua mensagem…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} />
        <span className="text-sm">Aceito os termos</span>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => {
            alert(
              `enabled=${enabled}\naccept=${accept}\nname=${name}\nmessage=${message}`,
            );
          }}
        >
          Enviar
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            setEnabled(false);
            setAccept(false);
            setName("");
            setMessage("");
          }}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
