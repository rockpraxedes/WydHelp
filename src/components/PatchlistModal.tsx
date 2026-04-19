import { useState, useEffect, useRef } from "react";
import {
  ScrollTextIcon,
  XIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  CornerDownRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PatchItem = { text: string; sub: string[] };
type PatchSection = { title: string; items: PatchItem[] };
type PatchData = { title: string; date: string; url: string; intro: string; sections: PatchSection[] };

const PROXY = "https://corsproxy.io/?";
const UPDATES_URL = "https://wydglobal.raidhut.com/pt-br/noticias/updates";

const SKIP_SECTIONS = [ "segurança do jogador", "seguranca do jogador" ];
const ALLOWED_SECTIONS = [ "atualiz", "corre", "aviso", "apagado", "rotina", "atividade" ];

function shouldShowSection( title: string ): boolean {
  const t = title.toLowerCase().trim();
  if ( SKIP_SECTIONS.some( ( s ) => t.includes( s ) ) ) return false;
  return ALLOWED_SECTIONS.some( ( s ) => t.includes( s ) );
}

async function fetchViaProxy( url: string ): Promise<string> {
  const res = await fetch( PROXY + encodeURIComponent( url ) );
  if ( !res.ok ) throw new Error( `HTTP ${res.status}` );
  return res.text();
}

function parseLatestPatchlistUrl( html: string ): string | null {
  const doc = new DOMParser().parseFromString( html, "text/html" );
  const links = Array.from( doc.querySelectorAll( "a[href]" ) ) as HTMLAnchorElement[];
  const found = links.find( ( a ) => {
    const href = a.getAttribute( "href" ) ?? "";
    const text = a.textContent?.toLowerCase() ?? "";
    return href.toLowerCase().includes( "patchlist" ) || text.toLowerCase().includes( "patchlist" );
  } );
  if ( !found ) return null;
  const href = found.getAttribute( "href" )!;
  if ( href.startsWith( "http" ) ) return href;
  return "https://wydglobal.raidhut.com" + ( href.startsWith( "/" ) ? "" : "/" ) + href;
}

function parsePatchPage( html: string, url: string ): PatchData {
  const doc = new DOMParser().parseFromString( html, "text/html" );

  // Título
  const allH1 = Array.from( doc.querySelectorAll( "h1" ) );
  const titleEl = allH1.find( ( h ) => h.textContent?.toLowerCase().includes( "patchlist" ) );
  const title = titleEl?.textContent?.trim() ?? "Patchlist";

  // Data
  const dateEl = doc.querySelector( "dd" ) ?? doc.querySelector( "time" );
  const date = dateEl?.textContent?.trim() ?? "";

  // Área de conteúdo
  const contentEl =
    doc.querySelector( ".item-page" ) ??
    doc.querySelector( "article" ) ??
    doc.querySelector( "[class*='article']" ) ??
    doc.querySelector( "main" ) ??
    doc.body;

  // Intro
  const intro = contentEl?.querySelector( "em" )?.textContent?.trim() ?? "";

  // ── PARSE DE SEÇÕES ──
  // Divide o HTML por <hr> e processa cada bloco
  const sections: PatchSection[] = [];
  const rawHtml = contentEl?.innerHTML ?? "";
  const chunks = rawHtml.split( /<hr\s*[^>]*>/i );

  for ( const chunk of chunks ) {
    const div = document.createElement( "div" );
    div.innerHTML = chunk;

    // Estratégia de detecção do título da seção:
    // 1) Tenta encontrar linha de texto que bata com seção conhecida
    // 2) Varre linhas do textContent do chunk antes da primeira <ul>
    let sectionTitle = "";

    // Remove o conteúdo das listas para isolar só o "cabeçalho" do chunk
    const divClone = div.cloneNode( true ) as HTMLDivElement;
    divClone.querySelectorAll( "ul, ol, img, script, style" ).forEach( ( el ) => el.remove() );
    const headerText = divClone.textContent ?? "";

    // Quebra por newlines/espaços múltiplos e pega linhas não-vazias
    const lines = headerText
      .split( /[\n\r]+/ )
      .map( ( l ) => l.trim() )
      .filter( ( l ) => l.length > 2 && l.length < 100 );

    for ( const line of lines ) {
      // Ignora linhas que são claramente intro (contêm "Olá", "Confira", "Atenciosamente")
      if ( /olá|confira|atenciosamente|jogadores/i.test( line ) ) continue;
      if ( shouldShowSection( line ) || SKIP_SECTIONS.some( ( s ) => line.toLowerCase().includes( s ) ) ) {
        sectionTitle = line;
        break;
      }
    }

    if ( !sectionTitle ) continue;
    if ( !shouldShowSection( sectionTitle ) ) continue;

    // ── ITENS ──
    // Estrutura: ul > li > (texto + ul > li com detalhes)
    const items: PatchItem[] = [];
    const topLis = Array.from( div.querySelectorAll( "ul > li" ) ) as HTMLLIElement[];

    for ( const li of topLis ) {
      // Pula sub-itens (li dentro de li)
      if ( li.parentElement?.closest( "li" ) ) continue;

      const subUl = li.querySelector( "ul" );

      // Texto do item pai sem sub-lista
      let text = "";
      if ( subUl ) {
        const clone = li.cloneNode( true ) as HTMLLIElement;
        clone.querySelector( "ul" )?.remove();
        text = clone.textContent?.trim() ?? "";
      } else {
        text = li.textContent?.trim() ?? "";
      }
      if ( !text ) continue;

      // Sub-itens
      const sub: string[] = subUl
        ? Array.from( subUl.querySelectorAll( "li" ) )
          .map( ( s ) => s.textContent?.trim() ?? "" )
          .filter( Boolean )
        : [];

      items.push( { text, sub } );
    }

    if ( items.length > 0 ) sections.push( { title: sectionTitle, items } );
  }

  return { title, date, intro, url, sections };
}

function getSectionStyle( title: string ): { badge: string; dot: string } {
  const t = title.toLowerCase();
  if ( t.includes( "atualiz" ) || t.includes( "corre" ) )
    return { badge: "text-violet-600 border-violet-400/40 bg-violet-500/10", dot: "bg-violet-500" };
  if ( t.includes( "aviso" ) )
    return { badge: "text-amber-600 border-amber-400/40 bg-amber-500/10", dot: "bg-amber-500" };
  if ( t.includes( "apagado" ) || t.includes( "remov" ) )
    return { badge: "text-red-600 border-red-400/40 bg-red-500/10", dot: "bg-red-500" };
  if ( t.includes( "rotina" ) || t.includes( "atividade" ) )
    return { badge: "text-sky-600 border-sky-400/40 bg-sky-500/10", dot: "bg-sky-500" };
  return { badge: "text-slate-600 border-slate-400/40 bg-slate-500/10", dot: "bg-slate-500" };
}

export function PatchlistModal() {
  const [ open, setOpen ] = useState( false );
  const [ loading, setLoading ] = useState( false );
  const [ patch, setPatch ] = useState<PatchData | null>( null );
  const [ error, setError ] = useState<string | null>( null );
  const overlayRef = useRef<HTMLDivElement>( null );

  const handleOverlayClick = ( e: React.MouseEvent<HTMLDivElement> ) => {
    if ( e.target === overlayRef.current ) setOpen( false );
  };

  useEffect( () => {
    const onKey = ( e: KeyboardEvent ) => { if ( e.key === "Escape" ) setOpen( false ); };
    window.addEventListener( "keydown", onKey );
    return () => window.removeEventListener( "keydown", onKey );
  }, [] );

  const fetchPatchlist = async () => {
    setLoading( true ); setError( null ); setPatch( null );
    try {
      const updatesHtml = await fetchViaProxy( UPDATES_URL );
      const patchUrl = parseLatestPatchlistUrl( updatesHtml );
      if ( !patchUrl ) throw new Error( "Nenhum patchlist encontrado." );
      const patchHtml = await fetchViaProxy( patchUrl );
      setPatch( parsePatchPage( patchHtml, patchUrl ) );
    } catch ( err: unknown ) {
      setError( err instanceof Error ? err.message : "Erro desconhecido" );
    } finally {
      setLoading( false );
    }
  };

  const handleOpen = () => {
    setOpen( true );
    if ( !patch && !loading ) fetchPatchlist();
  };

  return (
    <>
      {/* BOTÃO */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(109,40,217,0.18)",
          border: "1px solid rgba(167,139,250,0.4)",
          backdropFilter: "blur(8px)",
          borderRadius: "999px",
          padding: "6px 14px",
          color: "var(--violet-600, #7c3aed)",
        }}
      >
        <ScrollTextIcon className="w-3.5 h-3.5" />
        Patchlist
      </button>

      {/* MODAL */}
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--background, #fff)",
              border: "1px solid rgba(167,139,250,0.3)",
              boxShadow: "0 0 48px rgba(109,40,217,0.18)",
            }}
          >
            {/* Cabeçalho */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: "rgba(167,139,250,0.2)" }}
            >
              <div className="flex items-center gap-2.5">
                <ScrollTextIcon className="w-4 h-4 text-violet-500" />
                <span className="font-semibold text-sm">Último Patchlist</span>
                {patch?.date && (
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    {patch.date}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={fetchPatchlist} disabled={loading}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40" title="Recarregar">
                  <RefreshCwIcon className={cn( "w-3.5 h-3.5", loading && "animate-spin" )} />
                </button>
                <button onClick={() => setOpen( false )}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
                  <p className="text-sm text-muted-foreground">Buscando patchlist...</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-sm text-red-500 text-center">{error}</p>
                  <button onClick={fetchPatchlist} className="text-xs text-violet-600 underline underline-offset-2">
                    Tentar novamente
                  </button>
                </div>
              )}

              {patch && !loading && (
                <>
                  <div className="space-y-1">
                    <h2 className="font-bold text-base">{patch.title}</h2>
                    {patch.intro && (
                      <p className="text-xs text-muted-foreground italic">{patch.intro}</p>
                    )}
                  </div>

                  {patch.sections.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Nenhuma alteração encontrada.
                    </p>
                  )}

                  {patch.sections.map( ( section, si ) => {
                    const style = getSectionStyle( section.title );
                    return (
                      <div key={si} className="space-y-3">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md border",
                          style.badge
                        )}>
                          <span className={cn( "w-1.5 h-1.5 rounded-full shrink-0", style.dot )} />
                          {section.title}
                        </div>

                        <ul className="space-y-3 pl-1">
                          {section.items.map( ( item, ii ) => (
                            <li key={ii} className="space-y-1.5">
                              <div className="flex items-start gap-2 text-sm font-medium text-foreground">
                                <ChevronRightIcon className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                                <span>{item.text}</span>
                              </div>
                              {item.sub.length > 0 && (
                                <ul className="ml-6 space-y-1">
                                  {item.sub.map( ( sub, sii ) => (
                                    <li key={sii} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                      <CornerDownRightIcon className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />
                                      <span>{sub}</span>
                                    </li>
                                  ) )}
                                </ul>
                              )}
                            </li>
                          ) )}
                        </ul>
                      </div>
                    );
                  } )}
                </>
              )}
            </div>

            {/* Rodapé */}
            {patch?.url && !loading && (
              <div className="px-6 py-3 border-t shrink-0" style={{ borderColor: "rgba(167,139,250,0.2)" }}>
                <a href={patch.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 transition-colors">
                  <ExternalLinkIcon className="w-3 h-3" />
                  Ver post completo no site oficial
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}