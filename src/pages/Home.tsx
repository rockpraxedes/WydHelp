import { useState } from "react";
import { DailyTracker } from "@/components/DailyTracker";
import { ScheduleBoard } from "@/components/ScheduleBoard";
import { Runas } from "@/pages/Runas";
import { Ranking } from "@/pages/Ranking";
import { useProfiles } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/useToast";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ToastContainer } from "@/components/ToastContainer";
import { cn } from "@/lib/utils";
import { StreamersModal } from "@/components/StreamersModal";
import {
  SwordIcon,
  GemIcon,
  ClockIcon,
  TrophyIcon,
  HammerIcon,
} from "lucide-react";
import { Craft } from "@/pages/Craft";
import { ServerStatusWidget } from "@/components/ServerStatusWidget";
import { PatchlistModal } from "@/components/PatchlistModal";

type Tab = "missoes" | "runas" | "ranking" | "craft";
type MissaoSubTab = "diarias" | "horarios";

export function Home() {
  const [ tab, setTab ] = useState<Tab>( "missoes" );
  const [ missaoSubTab, setMissaoSubTab ] = useState<MissaoSubTab>( "diarias" );

  const { toasts, addToast, removeToast } = useToast();

  const {
    profiles,
    activeId: profileId,
    setActive,
    addProfile,
    renameProfile,
    deleteProfile,
    exportProfile,
    importAny,
  } = useProfiles();

  const activeProfile = profiles.find( ( p ) => p.id === profileId );

  const NAV_TABS = [
    { id: "missoes" as Tab, label: "Missões", Icon: SwordIcon },
    { id: "runas" as Tab, label: "Runas & Secretas", Icon: GemIcon },
    { id: "ranking" as Tab, label: "Ranking", Icon: TrophyIcon },
    { id: "craft" as Tab, label: "Craft", Icon: HammerIcon },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── HEADER ── */}
      <header className="relative w-full" style={{ height: "200px" }}>
        {/* Botão site do jogo — canto superior direito */}
        <div className="absolute top-3 right-4 z-50 flex flex-col items-end gap-3">
          <a
            href="https://wydglobal.raidhut.com/pt-br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(109,40,217,0.35)",
              border: "1px solid rgba(167,139,250,0.45)",
              backdropFilter: "blur(8px)",
              borderRadius: "999px",
              padding: "6px 14px",
              textDecoration: "none",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Jogar WYD Global
          </a>
          <StreamersModal />
        </div>

        {/* Imagem com overflow hidden isolado */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/header3-2.png"
            alt="WYD Global"
            className="w-full h-full object-contain object-center scale-180"
          />
        </div>

        {/* Perfil ativo — canto superior esquerdo */}
        {activeProfile && (
          <div className="absolute top-3 left-4 z-10">
            <div
              className="flex items-center gap-2 text-xs text-white/80"
              style={{
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(6px)",
                borderRadius: "999px",
                padding: "5px 12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              {activeProfile.name}
            </div>
          </div>
        )}

      </header>

      {/* ── CONTEÚDO ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Nav principal */}
        <nav className="flex items-center gap-1 border-b">
          {NAV_TABS.map( ( { id, label, Icon } ) => (
            <button
              key={id}
              onClick={() => setTab( id )}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2 -mb-px",
                tab === id
                  ? "border-violet-500 text-violet-600 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ) )}

          <div className="ml-auto pb-1 hidden sm:flex items-center gap-2 whitespace-nowrap">
            <a
              href="https://www.vakinha.com.br/vaquinha/hospedagem-top?utm_source=google-ads&utm_medium=cpc&utm_campaign=GA+-+%5BSearch%5D+%5BVakinhas%5D+Marca+%28Convers%C3%A3o%29+%28site%29&utm_campaign_id=22579434424"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs font-semibold rounded-md bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-white transition"
            >
              <span className="text-purple-400">💜</span>
              Apoiar projeto
            </a>
          </div>

          <div className="ml-auto pb-1 hidden sm:flex items-center gap-2 whitespace-nowrap">
            <PatchlistModal />
            <ServerStatusWidget />
          </div>
        </nav>

        {/* Mobile: aparece abaixo do nav, largura total */}
        <div className="sm:hidden">
          <ServerStatusWidget />
        </div>


        {/* ── ABA MISSÕES ── */}
        {tab === "missoes" && (
          <>
            {/* Sub-nav mobile */}
            <div className="flex lg:hidden gap-1 bg-muted/50 rounded-lg p-1">
              {(
                [
                  { id: "diarias", label: "Diárias", Icon: SwordIcon },
                  { id: "horarios", label: "Horários", Icon: ClockIcon },
                ] as {
                  id: MissaoSubTab;
                  label: string;
                  Icon: typeof SwordIcon;
                }[]
              ).map( ( { id, label, Icon } ) => (
                <button
                  key={id}
                  onClick={() => setMissaoSubTab( id )}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors",
                    missaoSubTab === id
                      ? "bg-background text-violet-600 font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ) )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div
                className={cn(
                  missaoSubTab === "horarios" ? "hidden lg:block" : "block",
                )}
              >
                <DailyTracker
                  key={profileId}
                  profileId={profileId}
                  onToast={addToast}
                  profileSelector={
                    <ProfileSelector
                      profiles={profiles}
                      activeId={profileId}
                      onSelect={setActive}
                      onAdd={addProfile}
                      onRename={renameProfile}
                      onDelete={( id ) => deleteProfile( id, profileId )}
                      onExport={exportProfile}
                      onImportAny={importAny}
                    />
                  }
                />
              </div>

              <div
                className={cn(
                  "lg:sticky lg:top-6",
                  missaoSubTab === "diarias" ? "hidden lg:block" : "block",
                )}
              >
                <ScheduleBoard />
              </div>
            </div>
          </>
        )}

        {tab === "runas" && <Runas onToast={addToast} />}
        {tab === "ranking" && <Ranking />}
        {tab === "craft" && <Craft />}
      </main>

      {/* ── RODAPÉ ── */}
      <footer className="border-t py-4 mt-8">
        <div className="flex items-center justify-center gap-3">
          <p className="text-xs text-muted-foreground">
            © Desenvolvido por {" "}
            <span className="text-violet-500 font-medium">
              Sérgio Praxedes (Cama)
            </span>
          </p>

          <a
            href="https://wa.me/5519992346159"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(37,211,102,0.15)",
              border: "1px solid rgba(37,211,102,0.45)",
              borderRadius: "999px",
              padding: "6px 14px",
              textDecoration: "none",
              color: "#25D366",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Fale comigo
          </a>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div >
  );
}
