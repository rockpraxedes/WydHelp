import { useEffect, useState } from "react";
import header from "../images/header.jpg";
import { RelogioBrasilia } from "@/components/RelogioBrasilia";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* =====================
   TIPOS
===================== */
type Perfil = {
  id: string;
  nome: string;
  diarias: {
    enabled: boolean;
    extras: {
      tpPremium: boolean;
      tpDesafio: boolean;
    };
    checks: {
      checkin: boolean;
      espolios: boolean;
      expedicao: boolean;
      deserto: boolean;
      portao: boolean;
      contrato: boolean;
    };
  };
};

/* =====================
   PERFIS PADRÃO
===================== */
const PERFIS_INICIAIS: Perfil[] = [
  {
    id: "principal",
    nome: "Principal",
    diarias: {
      enabled: false,
      extras: { tpPremium: false, tpDesafio: false },
      checks: {
        checkin: false,
        espolios: false,
        expedicao: false,
        deserto: false,
        portao: false,
        contrato: false,
      },
    },
  },
];

/* =====================
   COMPONENTE
===================== */
export default function Diarias() {
  const [perfis, setPerfis] = useState<Perfil[]>(PERFIS_INICIAIS);
  const [perfilAtivoId, setPerfilAtivoId] = useState("principal");
  const [novoNome, setNovoNome] = useState("");
  const [editarAberto, setEditarAberto] = useState(false);

  // ✅ DATA SELECIONADA (DATE PICKER COMPACTO)
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(
    new Date(),
  );

  const perfilAtivo = perfis.find((p) => p.id === perfilAtivoId) ?? perfis[0];

  useEffect(() => {
    setNovoNome(perfilAtivo.nome);
  }, [perfilAtivoId]);

  /* =====================
     PERFIL
  ===================== */
  function criarPerfil() {
    const novoPerfil: Perfil = {
      id: crypto.randomUUID(),
      nome: "Novo Perfil",
      diarias: structuredClone(perfilAtivo.diarias),
    };
    setPerfis([...perfis, novoPerfil]);
    setPerfilAtivoId(novoPerfil.id);
  }

  function renomearPerfil() {
    setPerfis(
      perfis.map((p) =>
        p.id === perfilAtivoId ? { ...p, nome: novoNome } : p,
      ),
    );
  }

  function excluirPerfil() {
    if (perfis.length <= 1) return;
    const novos = perfis.filter((p) => p.id !== perfilAtivoId);
    setPerfis(novos);
    setPerfilAtivoId(novos[0].id);
  }

  /* =====================
     DIÁRIAS
  ===================== */
  function setEnabled(value: boolean) {
    setPerfis(
      perfis.map((p) =>
        p.id === perfilAtivoId
          ? {
              ...p,
              diarias: {
                ...p.diarias,
                enabled: value,
                extras: value
                  ? p.diarias.extras
                  : { tpPremium: false, tpDesafio: false },
              },
            }
          : p,
      ),
    );
  }

  function setExtra(key: "tpPremium" | "tpDesafio", value: boolean) {
    setPerfis(
      perfis.map((p) =>
        p.id === perfilAtivoId
          ? {
              ...p,
              diarias: {
                ...p.diarias,
                extras: {
                  ...p.diarias.extras,
                  [key]: value,
                },
              },
            }
          : p,
      ),
    );
  }

  function setCheck(key: keyof Perfil["diarias"]["checks"], value: boolean) {
    setPerfis(
      perfis.map((p) =>
        p.id === perfilAtivoId
          ? {
              ...p,
              diarias: {
                ...p.diarias,
                checks: {
                  ...p.diarias.checks,
                  [key]: value,
                },
              },
            }
          : p,
      ),
    );
  }

  function resetarDiarias() {
    setPerfis(
      perfis.map((p) =>
        p.id === perfilAtivoId
          ? {
              ...p,
              diarias: {
                enabled: false,
                extras: {
                  tpPremium: false,
                  tpDesafio: false,
                },
                checks: Object.fromEntries(
                  Object.keys(p.diarias.checks).map((k) => [k, false]),
                ) as Perfil["diarias"]["checks"],
              },
            }
          : p,
      ),
    );
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen flex flex-col items-center gap-8 pt-8">
      {/* HEADER */}
      <div
        className="relative h-[200px] w-[700px] rounded-xl overflow-hidden"
        style={{
          backgroundImage: `url(${header})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <RelogioBrasilia />

      <div className="flex gap-8">
        {/* PERFIS */}
        <div className="w-[240px] border rounded-xl p-4 space-y-4 bg-card shadow">
          <h3 className="font-semibold text-lg">Perfis</h3>

          <Select value={perfilAtivoId} onValueChange={setPerfilAtivoId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perfis.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={criarPerfil}>
              Novo
            </Button>

            <Dialog open={editarAberto} onOpenChange={setEditarAberto}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1">
                  Editar nome
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar nome do perfil</DialogTitle>
                </DialogHeader>
                <Input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                />
                <Button
                  onClick={() => {
                    renomearPerfil();
                    setEditarAberto(false);
                  }}
                >
                  Salvar
                </Button>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={excluirPerfil}
            >
              Excluir
            </Button>
          </div>
        </div>

        {/* DIÁRIAS */}
        <div className="w-[300px] rounded-xl border bg-card p-6 shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Diárias</h2>

            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Evento TP
              </span>

              <Switch
                checked={perfilAtivo.diarias.enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[120px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataSelecionada ? (
                  format(dataSelecionada, "dd/MM/yyyy")
                ) : (
                  <span className="text-muted-foreground">
                    Selecione uma data
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                className="rounded-lg border"
                mode="single"
                selected={dataSelecionada}
                onSelect={setDataSelecionada}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* CHECKS */}
          {(
            [
              ["checkin", "Check-in"],
              ["espolios", "Espólios"],
              ["expedicao", "Expedição"],
              ["deserto", "Deserto Desconhecido"],
              ["portao", "Portão Infernal"],
              ["contrato", "Contrato de Caça"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex gap-3 items-center">
              <Checkbox
                checked={perfilAtivo.diarias.checks[key]}
                onCheckedChange={(v) => setCheck(key, !!v)}
              />
              {label}
            </label>
          ))}

          {perfilAtivo.diarias.enabled && (
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex gap-2 items-center">
                <Checkbox
                  checked={perfilAtivo.diarias.extras.tpPremium}
                  onCheckedChange={(v) => setExtra("tpPremium", !!v)}
                />
                TP - Teleporte Premium
              </label>

              <label className="flex gap-2 items-center">
                <Checkbox
                  checked={perfilAtivo.diarias.extras.tpDesafio}
                  onCheckedChange={(v) => setExtra("tpDesafio", !!v)}
                />
                TP - Espólio Desafio
              </label>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              className="flex-1"
              onClick={() => {
                console.log({
                  data: dataSelecionada
                    ? format(dataSelecionada, "yyyy-MM-dd")
                    : null,
                  perfil: perfilAtivo.nome,
                  diarias: perfilAtivo.diarias,
                });
              }}
            >
              Atualizar
            </Button>

            <Button
              variant="secondary"
              className="flex-1"
              onClick={resetarDiarias}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
