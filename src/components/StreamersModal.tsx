import { useState } from "react";
import { X } from "lucide-react";
import { StreamersContent } from "./StreamersContent";

export function StreamersModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* BOTÃO */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-foreground transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(220,38,38,0.35)",
          border: "1px solid rgba(248,113,113,0.45)",
          backdropFilter: "blur(8px)",
          borderRadius: "999px",
          padding: "6px 14px",
        }}
      >
        🔴 Streamers Online
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          {/* fundo */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* conteúdo */}
          <div className="relative z-10 w-[75%] sm:w-[70%] lg:w-[70%] max-h-[80vh] overflow-y-auto rounded-xl bg-background p-4 sm:p-6 border shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">🔴 Streamers Online</h2>

              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <StreamersContent />
          </div>
        </div>
      )}
    </>
  );
}
