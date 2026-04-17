// src/pages/Craft.tsx

import { useCallback, useMemo, useState } from "react";

// ── TIPOS ─────────────────────────────────────────────────────────────────

type ItemType = "mortal" | "celestial" | "reddragon" | "bahamut";

interface StepConfig {
  label: string;
  base: number;
  soulBonus?: number;
}

type ItemKind =
  | { type: "simple"; id: string; label: string }
  | { type: "leveled"; id: string; label: string; levels: number }
  | { type: "pl" };

interface Section {
  title: string;
  items: ItemKind[];
}

// ── DADOS CALCULADORA ─────────────────────────────────────────────────────

const DATA: Record<
  ItemType,
  {
    steps: StepConfig[];
    hasSoul: boolean;
    soulLabel?: string;
    creationRate?: number;
    creationLabel?: string;
  }
> = {
  mortal: {
    hasSoul: false,
    steps: [
      { label: "+12", base: 4 },
      { label: "+13", base: 3 },
      { label: "+14", base: 2 },
      { label: "+15", base: 1 },
    ],
  },
  celestial: {
    hasSoul: false,
    creationRate: 100,
    creationLabel: "Criação do item Celestial",
    steps: [
      { label: "+11 → +12", base: 100 },
      { label: "+12 → +13", base: 96 },
      { label: "+13 → +14", base: 60 },
      { label: "+14 → +15", base: 42 },
    ],
  },
  reddragon: {
    hasSoul: true,
    soulLabel: "Dragon Soul",
    creationRate: 45,
    creationLabel: "Composição Red Dragon",
    steps: [
      { label: "+9 → +10", base: 45, soulBonus: 2 },
      { label: "+10 → +11", base: 37.5, soulBonus: 2 },
      { label: "+11 → +12", base: 22.5, soulBonus: 2 },
      { label: "+12 → +13", base: 15, soulBonus: 2 },
      { label: "+13 → +14", base: 10, soulBonus: 1.5 },
      { label: "+14 → +15", base: 5, soulBonus: 1 },
    ],
  },
  bahamut: {
    hasSoul: true,
    soulLabel: "Bahamut Soul",
    creationRate: 20,
    creationLabel: "Composição Bahamut",
    steps: [
      { label: "+1 → +5", base: 20, soulBonus: 1 },
      { label: "+5 → +9", base: 15, soulBonus: 1 },
      { label: "+9 → +12", base: 10, soulBonus: 1 },
      { label: "+12 → +13", base: 5, soulBonus: 1 },
      { label: "+13 → +14", base: 5, soulBonus: 0.5 },
      { label: "+14 → +15", base: 5, soulBonus: 0.35 },
    ],
  },
};

const BLESSED_BONUS_PER = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15];

// ── DADOS INVENTÁRIO ──────────────────────────────────────────────────────

const SECTIONS: Record<ItemType, Section[]> = {
  mortal: [
    {
      title: "Materiais",
      items: [
        { type: "pl" },
        {
          type: "leveled",
          id: "ref_abencoada",
          label: "Ref. Abençoada",
          levels: 10,
        },
      ],
    },
  ],
  celestial: [
    {
      title: "Criação",
      items: [
        { type: "simple", id: "pedra_sol", label: "Pedra do Sol" },
        { type: "simple", id: "pedra_vento", label: "Pedra do Vento" },
        { type: "simple", id: "pedra_agua", label: "Pedra da Água" },
        { type: "simple", id: "pedra_terra", label: "Pedra da Terra" },
        { type: "simple", id: "pedra_lunar", label: "Pedra Lunar" },
        { type: "simple", id: "pedra_escuridao", label: "Pedra da Escuridão" },
      ],
    },
    {
      title: "Refinação",
      items: [
        { type: "simple", id: "essence_gods", label: "Essence of Gods" },
        { type: "simple", id: "essence_gods_9", label: "Essence of Gods +9" },
        { type: "simple", id: "pedra_valkiria", label: "Pedra da Valkiria" },
        { type: "simple", id: "soul_fragment", label: "Soul Fragment" },
      ],
    },
  ],
  reddragon: [
    {
      title: "Criação",
      items: [
        { type: "simple", id: "mark_bahamut", label: "Mark of Bahamut" },
        { type: "simple", id: "rd_scale", label: "Red Dragon Scale" },
        { type: "simple", id: "pedra_sol", label: "Pedra do Sol" },
        { type: "simple", id: "pedra_vento", label: "Pedra do Vento" },
        { type: "simple", id: "pedra_agua", label: "Pedra da Água" },
        { type: "simple", id: "pedra_terra", label: "Pedra da Terra" },
        {
          type: "leveled",
          id: "dragon_soul",
          label: "Dragon Soul",
          levels: 10,
        },
      ],
    },
    {
      title: "Refinação",
      items: [
        { type: "simple", id: "valkiria_9", label: "Valkiria +9" },
        { type: "simple", id: "rd_scale", label: "Red Dragon Scale" },
        {
          type: "leveled",
          id: "dragon_soul",
          label: "Dragon Soul",
          levels: 10,
        },
      ],
    },
  ],
  bahamut: [
    {
      title: "Criação",
      items: [
        { type: "simple", id: "bahamut_horn", label: "Bahamut Horn" },
        { type: "simple", id: "bahamut_rune", label: "Bahamut Rune" },
        { type: "simple", id: "rd_scale", label: "Red Dragon Scale" },
        { type: "simple", id: "bahamut_blood", label: "Bahamut Blood" },
        {
          type: "leveled",
          id: "bahamut_soul",
          label: "Bahamut Soul",
          levels: 10,
        },
      ],
    },
    {
      title: "Refinação",
      items: [
        { type: "simple", id: "valkiria_9", label: "Valkiria +9" },
        {
          type: "leveled",
          id: "bahamut_soul",
          label: "Bahamut Soul",
          levels: 10,
        },
        { type: "simple", id: "bahamut_horn", label: "Bahamut Horn" },
        { type: "simple", id: "bahamut_rune", label: "Bahamut Rune" },
      ],
    },
  ],
};

// ── DADOS ITENS NECESSÁRIOS (modal) ───────────────────────────────────────

const ITEMS_NECESSARIOS: Record<ItemType, Section[]> = {
  mortal: [
    {
      title: "Materiais",
      items: [
        { type: "pl" },
        {
          type: "leveled",
          id: "ref_abencoada",
          label: "Ref. Abençoada",
          levels: 10,
        },
      ],
    },
  ],
  celestial: [
    {
      title: "Criação",
      items: [
        { type: "simple", id: "pedra_sol", label: "Pedra do Sol" },
        { type: "simple", id: "pedra_vento", label: "Pedra do Vento" },
        { type: "simple", id: "pedra_agua", label: "Pedra da Água" },
        { type: "simple", id: "pedra_terra", label: "Pedra da Terra" },
        { type: "simple", id: "item_selado_9", label: "Item Selado +9" },
        { type: "simple", id: "item_arch_15", label: "Item Arch +15" },
        { type: "simple", id: "pedra_lunar", label: "Pedra Lunar" },
        { type: "simple", id: "pedra_escuridao", label: "Pedra da Escuridão" },
      ],
    },
    {
      title: "Refinação",
      items: [
        { type: "simple", id: "essence_gods", label: "Essence of Gods" },
        { type: "simple", id: "essence_gods_9", label: "Essence of Gods +9" },
        { type: "simple", id: "pedra_valkiria", label: "Pedra da Valkiria" },
        { type: "simple", id: "soul_fragment", label: "Soul Fragment" },
      ],
    },
  ],
  reddragon: [
    {
      title: "Criação",
      items: [
        { type: "simple", id: "mark_bahamut", label: "Mark of Bahamut" },
        { type: "simple", id: "rd_scale", label: "Red Dragon Scale" },
        { type: "simple", id: "pedra_sol", label: "Pedra do Sol" },
        { type: "simple", id: "pedra_vento", label: "Pedra do Vento" },
        { type: "simple", id: "pedra_agua", label: "Pedra da Água" },
        { type: "simple", id: "pedra_terra", label: "Pedra da Terra" },
        { type: "simple", id: "item_cel_15", label: "Item Celestial +15" },
        {
          type: "leveled",
          id: "dragon_soul",
          label: "Dragon Soul",
          levels: 10,
        },
      ],
    },
    {
      title: "Refinação",
      items: [
        { type: "simple", id: "valkiria_9", label: "Valkiria +9" },
        { type: "simple", id: "rd_scale", label: "Red Dragon Scale" },
        {
          type: "leveled",
          id: "dragon_soul",
          label: "Dragon Soul",
          levels: 10,
        },
      ],
    },
  ],
  bahamut: [
    {
      title: "Criação",
      items: [
        { type: "simple", id: "item_rd_15", label: "Item RD +15" },
        { type: "simple", id: "bahamut_horn", label: "Bahamut Horn" },
        { type: "simple", id: "bahamut_rune", label: "Bahamut Rune" },
        { type: "simple", id: "rd_scale", label: "Red Dragon Scale" },
        { type: "simple", id: "bahamut_blood", label: "Bahamut Blood" },
        {
          type: "leveled",
          id: "bahamut_soul",
          label: "Bahamut Soul",
          levels: 10,
        },
      ],
    },
    {
      title: "Refinação",
      items: [
        { type: "simple", id: "valkiria_9", label: "Valkiria +9" },
        {
          type: "leveled",
          id: "bahamut_soul",
          label: "Bahamut Soul",
          levels: 10,
        },
        { type: "simple", id: "bahamut_horn", label: "Bahamut Horn" },
        { type: "simple", id: "bahamut_rune", label: "Bahamut Rune" },
      ],
    },
  ],
};

// ── CORES ─────────────────────────────────────────────────────────────────

const TYPE_ACCENT: Record<ItemType, string> = {
  mortal: "#16a34a",
  celestial: "#0ea5e9",
  reddragon: "#dc2626",
  bahamut: "#d97706",
};

const TYPE_LABEL: Record<ItemType, string> = {
  mortal: "Mortal / Arch",
  celestial: "Celestial",
  reddragon: "Red Dragon",
  bahamut: "Bahamut",
};

const TYPE_ORDER: ItemType[] = ["mortal", "celestial", "reddragon", "bahamut"];

// ── STORAGE ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "wyd_inventario";
type Estoque = Record<string, number>;

function loadEstoque(): Estoque {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveEstoque(e: Estoque) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
}

function useInventario() {
  const [estoque, setEstoque] = useState<Estoque>(loadEstoque);
  const get = useCallback((key: string) => estoque[key] ?? 0, [estoque]);
  const inc = useCallback((key: string, delta: number) => {
    setEstoque((prev) => {
      const next = { ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) };
      saveEstoque(next);
      return next;
    });
  }, []);
  return { get, inc };
}

// ── HELPERS ───────────────────────────────────────────────────────────────

function flatItems(itemType: ItemType): ItemKind[] {
  const seen = new Set<string>();
  const result: ItemKind[] = [];
  for (const section of SECTIONS[itemType]) {
    for (const item of section.items) {
      const key =
        item.type === "pl"
          ? "pl"
          : item.type === "leveled"
            ? `leveled_${item.id}`
            : item.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
  }
  return result;
}

// ── INVENTÁRIO — SUB-COMPONENTES ──────────────────────────────────────────

function SimpleRow({
  label,
  stockKey,
  accent,
  get,
  inc,
}: {
  label: string;
  stockKey: string;
  accent: string;
  get: (k: string) => number;
  inc: (k: string, d: number) => void;
}) {
  const val = get(stockKey);
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <button
        onClick={() => inc(stockKey, -1)}
        disabled={val === 0}
        className="w-6 h-6 rounded border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-white/30 disabled:opacity-30 transition-all"
      >
        −
      </button>
      <span
        className="w-8 text-center text-xs font-semibold tabular-nums"
        style={{ color: val > 0 ? accent : undefined }}
      >
        {val}
      </span>
      <button
        onClick={() => inc(stockKey, 1)}
        className="w-6 h-6 rounded border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
      >
        +
      </button>
    </div>
  );
}

function PLRow({
  accent,
  get,
  inc,
}: {
  accent: string;
  get: (k: string) => number;
  inc: (k: string, d: number) => void;
}) {
  const val = get("pl");
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="flex-1 text-xs text-muted-foreground">PL</span>
      <button
        onClick={() => inc("pl", -10)}
        disabled={val === 0}
        className="w-6 h-6 rounded border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-white/30 disabled:opacity-30 transition-all"
      >
        −
      </button>
      <span
        className="w-14 text-center text-xs font-semibold tabular-nums"
        style={{ color: val > 0 ? accent : undefined }}
      >
        {val.toLocaleString()}
      </span>
      <button
        onClick={() => inc("pl", 10)}
        className="w-6 h-6 rounded border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
      >
        +
      </button>
    </div>
  );
}

function LeveledBlock({
  baseId,
  label,
  levels,
  accent,
  get,
  inc,
}: {
  baseId: string;
  label: string;
  levels: number;
  accent: string;
  get: (k: string) => number;
  inc: (k: string, d: number) => void;
}) {
  return (
    <div className="py-1.5 border-b border-white/5 last:border-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: levels }, (_, i) => {
          const key = `${baseId}_${i}`;
          const val = get(key);
          const hasVal = val > 0;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground font-mono">
                +{i}
              </span>
              <div className="relative">
                <button
                  onClick={() => inc(key, 1)}
                  className="w-9 h-9 rounded-lg border text-xs font-semibold transition-all duration-150"
                  style={
                    hasVal
                      ? {
                          background: `${accent}22`,
                          borderColor: accent,
                          color: accent,
                        }
                      : {
                          background: "transparent",
                          borderColor: "rgba(255,255,255,0.10)",
                          color: "rgba(255,255,255,0.3)",
                        }
                  }
                >
                  {val}
                </button>
                {hasVal && (
                  <button
                    onClick={() => inc(key, -1)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black/60 border border-white/20 text-[9px] text-white/60 hover:text-white hover:border-white/50 flex items-center justify-center transition-all"
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventarioPanel({ itemType }: { itemType: ItemType }) {
  const { get, inc } = useInventario();
  const accent = TYPE_ACCENT[itemType];
  const items = useMemo(() => flatItems(itemType), [itemType]);

  return (
    <div
      className="rounded-xl border p-3 w-64 shrink-0"
      style={{ borderColor: `${accent}30`, background: `${accent}08` }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-wider mb-3"
        style={{ color: accent }}
      >
        Inventário
      </p>
      <div>
        {items.map((item, idx) => {
          if (item.type === "pl")
            return <PLRow key="pl" accent={accent} get={get} inc={inc} />;
          if (item.type === "leveled")
            return (
              <LeveledBlock
                key={`${item.id}_${idx}`}
                baseId={item.id}
                label={item.label}
                levels={item.levels}
                accent={accent}
                get={get}
                inc={inc}
              />
            );
          return (
            <SimpleRow
              key={`${item.id}_${idx}`}
              label={item.label}
              stockKey={item.id}
              accent={accent}
              get={get}
              inc={inc}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── MODAL DE ITENS NECESSÁRIOS ────────────────────────────────────────────

function ItensModal({
  itemType,
  accent,
  onClose,
}: {
  itemType: ItemType;
  accent: string;
  onClose: () => void;
}) {
  const sections = ITEMS_NECESSARIOS[itemType];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        style={{ borderColor: `${accent}40`, background: "#0f1117" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: accent }}>
            Itens Necessários — {TYPE_LABEL[itemType]}
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-sm flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>
        {sections.map((section) => (
          <div key={section.title}>
            <p
              className="text-[10px] font-medium uppercase tracking-wider mb-2 pb-1 border-b"
              style={{ color: accent, borderColor: `${accent}30` }}
            >
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item, idx) => {
                const dot = (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: accent }}
                  />
                );
                if (item.type === "pl")
                  return (
                    <li
                      key="pl"
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      {dot} PL (Gold)
                    </li>
                  );
                if (item.type === "leveled")
                  return (
                    <li
                      key={`${item.id}_${idx}`}
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      {dot} {item.label}{" "}
                      <span className="text-white/30">
                        (+0 a +{item.levels - 1})
                      </span>
                    </li>
                  );
                return (
                  <li
                    key={`${item.id}_${idx}`}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    {dot} {item.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SWITCH ────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  accent,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accent: string;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors select-none"
    >
      <span>{label}</span>
      <span
        className="relative inline-flex w-9 h-5 rounded-full border transition-all duration-200"
        style={{
          background: checked ? `${accent}66` : "rgba(255,255,255,0.08)",
          borderColor: checked ? accent : "rgba(255,255,255,0.15)",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{
            background: checked ? accent : "rgba(255,255,255,0.3)",
            transform: checked ? "translateX(16px)" : "translateX(0)",
          }}
        />
      </span>
    </button>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────

export function Craft() {
  const [itemType, setItemType] = useState<ItemType>("mortal");
  const [stepIdx, setStepIdx] = useState(0);
  const [soulLvl, setSoulLvl] = useState(0);
  const [blessedLvl, setBlessedLvl] = useState(0);
  const [showInventario, setShowInventario] = useState(true);
  const [showItensModal, setShowItensModal] = useState(false);

  const config = DATA[itemType];
  const safeStepIdx = Math.min(stepIdx, config.steps.length - 1);
  const step = config.steps[safeStepIdx];
  const accent = TYPE_ACCENT[itemType];

  const base = step.base;
  let bonus = 0;
  let bonusLabel = "";

  if (config.hasSoul && step.soulBonus) {
    bonus = parseFloat((step.soulBonus * soulLvl).toFixed(4));
    bonusLabel = `Bônus ${config.soulLabel} +${soulLvl}`;
  } else if (itemType === "mortal") {
    bonus = BLESSED_BONUS_PER[blessedLvl] * 4;
    bonusLabel = `4x Ref. Abençoada +${blessedLvl} (${BLESSED_BONUS_PER[blessedLvl]}% × 4)`;
  }

  const final = Math.min(100, parseFloat((base + bonus).toFixed(4)));

  function handleTypeChange(t: ItemType) {
    setItemType(t);
    setStepIdx(0);
    setSoulLvl(0);
    setBlessedLvl(0);
  }

  return (
    <div className="space-y-6">
      {showItensModal && (
        <ItensModal
          itemType={itemType}
          accent={accent}
          onClose={() => setShowItensModal(false)}
        />
      )}

      {/* Título */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Calculadora de Refinação
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Selecione o tipo de item, a etapa e o bônus para ver a chance final.
        </p>
      </div>

      {/* Seletor de tipo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TYPE_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className="py-2.5 px-3 rounded-lg text-sm font-medium border transition-all duration-150"
            style={
              itemType === t
                ? {
                    background: `${TYPE_ACCENT[t]}22`,
                    borderColor: TYPE_ACCENT[t],
                    color: TYPE_ACCENT[t],
                  }
                : {
                    background: "transparent",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)",
                  }
            }
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Layout: inventário à esquerda + calculadora à direita */}
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
        {/* ── Inventário (esquerda) ── */}
        {showInventario && (
          <div className="w-full lg:w-64 shrink-0">
            <InventarioPanel itemType={itemType} />
          </div>
        )}

        {/* ── Calculadora (direita) ── */}
        <div
          className="w-full lg:w-180 shrink-0 rounded-xl border p-4 space-y-4"
          style={{ borderColor: `${accent}30`, background: `${accent}08` }}
        >
          {/* Controles dentro do quadro */}
          <div className="flex items-center justify-between">
            <Toggle
              checked={showInventario}
              onChange={setShowInventario}
              accent={accent}
              label="Inventário"
            />
            <button
              onClick={() => setShowItensModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
              style={{
                borderColor: `${accent}50`,
                background: `${accent}12`,
                color: accent,
              }}
            >
              <span>📦</span> Itens Necessários
            </button>
          </div>

          {/* Taxa de criação */}
          {config.creationRate !== undefined && (
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2 border text-sm"
              style={{ borderColor: `${accent}30`, background: `${accent}12` }}
            >
              <span className="text-muted-foreground text-xs">
                {config.creationLabel}
              </span>
              <span className="font-semibold text-xs" style={{ color: accent }}>
                {config.creationRate}%
              </span>
            </div>
          )}

          {/* Etapas */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Etapa de refinação
            </p>
            <div className="flex flex-wrap gap-1.5">
              {config.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStepIdx(i)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 border"
                  style={
                    safeStepIdx === i
                      ? {
                          background: accent,
                          borderColor: accent,
                          color: "#fff",
                        }
                      : {
                          background: "transparent",
                          borderColor: "rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.5)",
                        }
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Soul selector */}
          {config.hasSoul && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {config.soulLabel} nível
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSoulLvl(i)}
                    className="h-8 rounded-lg text-xs font-mono transition-all duration-150 border"
                    style={
                      soulLvl === i
                        ? {
                            background: accent,
                            borderColor: accent,
                            color: "#fff",
                          }
                        : {
                            background: "transparent",
                            borderColor: "rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.5)",
                          }
                    }
                  >
                    +{i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Refinação Abençoada */}
          {itemType === "mortal" && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Refinação Abençoada nível
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setBlessedLvl(i)}
                    className="h-8 rounded-lg text-xs font-mono transition-all duration-150 border"
                    style={
                      blessedLvl === i
                        ? {
                            background: accent,
                            borderColor: accent,
                            color: "#fff",
                          }
                        : {
                            background: "transparent",
                            borderColor: "rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.5)",
                          }
                    }
                  >
                    +{i}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                4 pedras · +{blessedLvl} = {BLESSED_BONUS_PER[blessedLvl]}% ·
                bônus total = {BLESSED_BONUS_PER[blessedLvl] * 4}%
              </p>
            </div>
          )}

          {/* Resultado */}
          <div
            className="rounded-lg p-3 border"
            style={{ borderColor: `${accent}40`, background: `${accent}12` }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: accent }}
            >
              Resultado — {TYPE_LABEL[itemType]}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                Taxa base:{" "}
                <span className="text-foreground font-medium">{base}%</span>
              </p>
              {bonus > 0 && (
                <p>
                  {bonusLabel}:{" "}
                  <span className="text-foreground font-medium">+{bonus}%</span>
                </p>
              )}
            </div>
            <div
              className="mt-2 pt-2 border-t"
              style={{ borderColor: `${accent}30` }}
            >
              <p className="text-sm font-semibold" style={{ color: accent }}>
                Chance final: {final}%
              </p>
              <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${final}%`, background: accent }}
                />
              </div>
            </div>
          </div>

          {itemType === "celestial" && (
            <p className="text-xs text-muted-foreground text-center">
              Itens Celestiais não utilizam Soul.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
