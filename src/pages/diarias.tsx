import { useEffect, useState } from "react";
import header from "../images/header.jpg";

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

  const perfilAtivo = perfis.find((p) => p.id === perfilAtivoId)!;

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
    setEnabled(false);
    setExtra("tpPremium", false);
    setExtra("tpDesafio", false);

    Object.keys(perfilAtivo.diarias.checks).forEach((key) => {
      setCheck(key as keyof Perfil["diarias"]["checks"], false);
    });
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
        <div className="absolute inset-0 bg-black/20" />
      </div>

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

          {/* EDITAR NOME */}
          <div className="flex gap-2">
            {/* BOTÃO NOVO */}
            <Button className="flex-1" onClick={criarPerfil}>
              Novo
            </Button>

            {/* EDITAR NOME (COM DIALOG) */}
            <Dialog open={editarAberto} onOpenChange={setEditarAberto}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setEditarAberto(true)}
                >
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

            {/* BOTÃO EXCLUIR */}
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
        <div className="w-[320px] rounded-xl border bg-card p-6 shadow space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Diárias</h2>

            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground">Evento TP</span>
              <Switch
                checked={perfilAtivo.diarias.enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
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
              <label key={key} className="flex gap-2 items-center">
                <Checkbox
                  checked={perfilAtivo.diarias.checks[key]}
                  onCheckedChange={(v) => setCheck(key, !!v)}
                />
                {label}
              </label>
            ))}

            {perfilAtivo.diarias.enabled && (
              <div className="flex flex-col gap-3 pt-3">
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
              <Button className="flex-1">Atualizar</Button>

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
    </div>
  );
}
