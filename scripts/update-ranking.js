#!/usr/bin/env node
/**
 * update-ranking.js
 *
 * Funciona tanto localmente (node scripts/update-ranking.js)
 * quanto no GitHub Actions.
 *
 * O que faz a cada execução:
 *  1. Busca os dados da API (ou usa arquivo local se passado como argumento)
 *  2. Salva snapshot pré-arena (10–25 min antes do horário de arena)
 *  3. Detecta resultado de arena (5–90 min após horário de arena)
 *     - Quem ganhou (teve wins++), mais kills, menos deaths
 *  4. Atualiza ranking.json, ranking-snapshot.json e arena-history.json
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// ─── Configuração ───────────────────────────────────────────────────────────

const PUBLIC_DIR = path.join( __dirname, '..', 'public' );
const RANKING_PATH = path.join( PUBLIC_DIR, 'ranking.json' );
const SNAPSHOT_PATH = path.join( PUBLIC_DIR, 'ranking-snapshot.json' );
const HISTORY_PATH = path.join( PUBLIC_DIR, 'arena-history.json' );

const API_URL = 'https://rn3xfhamppsetddkod6vwc24lu0lhcek.lambda-url.us-east-1.on.aws/royal-arena';

// Horários das arenas em BRT (UTC-3)
const ARENA_HOURS_BRT = [ 13, 19, 23 ];

// ─── Utilidades de tempo ────────────────────────────────────────────────────

function toBRT( date = new Date() ) {
  return new Date( date.getTime() - 3 * 60 * 60 * 1000 );
}

function brtDateStr( date = new Date() ) {
  return toBRT( date ).toISOString().slice( 0, 10 ); // "YYYY-MM-DD"
}

function brtHour( date = new Date() ) { return toBRT( date ).getUTCHours(); }
function brtMinute( date = new Date() ) { return toBRT( date ).getUTCMinutes(); }

function brtMinOfDay( date = new Date() ) {
  return brtHour( date ) * 60 + brtMinute( date );
}

/** Retorna { label, minutesSince } da arena mais próxima que já passou */
function closestPastArena( date = new Date() ) {
  const now = brtMinOfDay( date );
  let best = null, bestDiff = Infinity;
  for ( const h of ARENA_HOURS_BRT ) {
    let diff = now - h * 60;
    if ( diff < 0 ) diff += 24 * 60;   // virada de meia-noite
    if ( diff < bestDiff ) {
      bestDiff = diff;
      best = `${String( h ).padStart( 2, '0' )}:00`;
    }
  }
  return { label: best, minutesSince: bestDiff };
}

/** Minutos até a próxima arena */
function minutesToNextArena( date = new Date() ) {
  const now = brtMinOfDay( date );
  let min = Infinity;
  for ( const h of ARENA_HOURS_BRT ) {
    let diff = h * 60 - now;
    if ( diff <= 0 ) diff += 24 * 60;
    if ( diff < min ) min = diff;
  }
  return min;
}

// ─── I/O ────────────────────────────────────────────────────────────────────

function readJSON( p, fallback ) {
  try { return JSON.parse( fs.readFileSync( p, 'utf8' ) ); }
  catch { return fallback; }
}

function writeJSON( p, data, pretty = false ) {
  fs.writeFileSync( p, pretty ? JSON.stringify( data, null, 2 ) : JSON.stringify( data ) );
}

function fetchJSON( url ) {
  return new Promise( ( resolve, reject ) => {
    https.get( url, { timeout: 15_000 }, ( res ) => {
      let body = '';
      res.on( 'data', c => body += c );
      res.on( 'end', () => {
        try { resolve( JSON.parse( body ) ); }
        catch { reject( new Error( 'JSON inválido: ' + body.slice( 0, 200 ) ) ); }
      } );
    } ).on( 'error', reject ).on( 'timeout', () => reject( new Error( 'Timeout' ) ) );
  } );
}

// ─── Lógica de arena ─────────────────────────────────────────────────────────

function buildMap( players = [] ) {
  const m = {};
  for ( const p of players ) m[ p.charName ] = p;
  return m;
}

/**
 * Compara newPlayers com oldPlayers e detecta resultado de arena.
 * Retorna entrada de histórico ou null se não houve vencedores.
 */
function detectArenaResult( newPlayers, oldPlayers, type, timestamp ) {
  const oldMap = buildMap( oldPlayers );
  const winners = [];
  let mostKills = null;
  let leastDeaths = null;
  let maxKD = -1;
  let minDD = Infinity;

  for ( const p of newPlayers ) {
    const old = oldMap[ p.charName ];
    if ( !old ) continue;

    const winsDelta = ( p.wins ?? 0 ) - ( old.wins ?? 0 );
    const killsDelta = ( p.kills ?? 0 ) - ( old.kills ?? 0 );
    const deathsDelta = ( p.deaths ?? 0 ) - ( old.deaths ?? 0 );

    if ( winsDelta <= 0 ) continue;
    winners.push( p.charName );

    if ( killsDelta > maxKD ) {
      maxKD = killsDelta;
      mostKills = { name: p.charName, kills: killsDelta };
    }
    if ( deathsDelta < minDD ) {
      minDD = deathsDelta;
      leastDeaths = { name: p.charName, deaths: deathsDelta };
    }
  }

  if ( winners.length === 0 ) return null;

  const { label: arenaLabel } = closestPastArena( new Date( timestamp ) );

  return {
    timestamp,
    arenaLabel,
    type,
    winners,
    mostKills: mostKills ?? { name: '-', kills: 0 },
    leastDeaths: leastDeaths ?? { name: '-', deaths: 0 },
  };
}

/** Verifica se a arena já foi registrada no histórico para hoje */
function alreadyRecorded( history, type, arenaLabel, dateStr ) {
  return history.some( e =>
    e.type === type &&
    e.arenaLabel === arenaLabel &&
    brtDateStr( new Date( e.timestamp ) ) === dateStr
  );
}

/**
 * Busca o snapshot pré-arena mais recente ANTES do horário da arena.
 * Chave no snapshot: "{type}_{HH:MM}" (horário BRT da captura).
 */
function findPreSnapshot( snapshots, type, arenaLabel ) {
  const arenaHour = parseInt( arenaLabel );
  const arenaMin = arenaHour * 60;

  let bestKey = null;
  let bestMin = -1;

  for ( const key of Object.keys( snapshots ) ) {
    // Suporta tanto "champion_20:30" quanto "champion_pre_19:00"
    const match = key.match( new RegExp( `^${type}_(pre_)?(\\d{1,2}):(\\d{2})$` ) );
    if ( !match ) continue;

    const h = parseInt( match[ 2 ] );
    const m = parseInt( match[ 3 ] );
    const tot = h * 60 + m;

    // Queremos o snapshot mais recente que ainda estava antes da arena
    // Toleramos snapshots até 3h antes (evita usar snapshots de ontem)
    if ( tot < arenaMin && tot > bestMin && ( arenaMin - tot ) <= 180 ) {
      bestMin = tot;
      bestKey = key;
    }
  }

  if ( bestKey ) {
    console.log( `  📂 Snapshot pré-arena: "${bestKey}"` );
    return snapshots[ bestKey ];
  }
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  console.log( `\n🕐 ${now.toISOString()} (${brtHour( now ).toString().padStart( 2, '0' )}:${brtMinute( now ).toString().padStart( 2, '0' )} BRT)` );

  // 1. Buscar dados ─────────────────────────────────────────────────────────
  let newData;
  if ( process.argv[ 2 ] ) {
    // Modo local: passe o arquivo como argumento
    //   node scripts/update-ranking.js public/ranking-new.json
    newData = readJSON( process.argv[ 2 ], null );
    console.log( '📂 Modo local – usando arquivo:', process.argv[ 2 ] );
  } else {
    console.log( '🌐 Buscando API...' );
    newData = await fetchJSON( API_URL );
  }

  if ( !newData || ( !newData.champion && !newData.aspirant ) ) {
    console.error( '❌ Dados inválidos ou vazios recebidos' );
    process.exit( 1 );
  }

  const champion = newData.champion ?? [];
  const aspirant = newData.aspirant ?? [];

  // 2. Carregar estado atual ─────────────────────────────────────────────────
  const snapshots = readJSON( SNAPSHOT_PATH, {} );
  const history = readJSON( HISTORY_PATH, [] );
  const dateStr = brtDateStr( now );
  const nowMin = brtMinOfDay( now );
  const minsToNext = minutesToNextArena( now );
  const { label: arenaLabel, minutesSince } = closestPastArena( now );

  console.log( `⏱  Arena mais próxima passada: ${arenaLabel} (${minutesSince} min atrás)` );
  console.log( `⏱  Próxima arena em: ${minsToNext} min` );

  // 3. Snapshot pré-arena (10–25 min antes) ─────────────────────────────────
  if ( minsToNext >= 10 && minsToNext <= 25 ) {
    const hh = String( brtHour( now ) ).padStart( 2, '0' );
    const mm = String( brtMinute( now ) ).padStart( 2, '0' );
    const champKey = `champion_${hh}:${mm}`;
    const aspirKey = `aspirant_${hh}:${mm}`;

    // Só salva uma vez por "janela" — verifica se já tem snapshot muito próximo
    const hasSimilar = Object.keys( snapshots ).some( k => {
      const match = k.match( /(\d{1,2}):(\d{2})$/ );
      if ( !match ) return false;
      const h = parseInt( match[ 1 ] ), m = parseInt( match[ 2 ] );
      return Math.abs( ( h * 60 + m ) - nowMin ) < 10;
    } );

    if ( !hasSimilar ) {
      snapshots[ champKey ] = champion;
      snapshots[ aspirKey ] = aspirant;
      console.log( `📸 Snapshot pré-arena salvo: ${champKey}` );
    }
  }

  // 4. Detectar resultado de arena (5–90 min após) ───────────────────────────
  const newEntries = [];

  if ( minutesSince >= 5 && minutesSince <= 90 ) {
    console.log( `🔍 Verificando resultado para arena ${arenaLabel}...` );

    for ( const type of [ 'champion', 'aspirant' ] ) {
      if ( alreadyRecorded( history, type, arenaLabel, dateStr ) ) {
        console.log( `  ✅ ${type} ${arenaLabel} já registrado hoje` );
        continue;
      }

      const arenaHour = parseInt( arenaLabel );
      const preSnapshot = findPreSnapshot( snapshots, type, arenaLabel );

      // Fallback: lê o ranking.json atual como estado "antes"
      // (menos preciso, mas melhor que nada)
      const oldRanking = readJSON( RANKING_PATH, { champion: [], aspirant: [] } );
      const oldPlayers = preSnapshot ?? ( oldRanking[ type ] ?? [] );
      const newPlayers = type === 'champion' ? champion : aspirant;

      const entry = detectArenaResult( newPlayers, oldPlayers, type, now.toISOString() );

      if ( entry ) {
        newEntries.push( entry );
        console.log( `  🏆 ${type} ${arenaLabel}: ${entry.winners.length} vencedores` );
        console.log( `     Mais kills:  ${entry.mostKills.name} (${entry.mostKills.kills})` );
        console.log( `     Menos deaths: ${entry.leastDeaths.name} (${entry.leastDeaths.deaths})` );
      } else {
        console.log( `  ⚠️  ${type} ${arenaLabel}: nenhum vencedor detectado (wins não mudaram)` );
      }
    }
  }

  // 5. Montar histórico atualizado ──────────────────────────────────────────
  const updatedHistory = [ ...newEntries, ...history ];

  // 6. Salvar arquivos ───────────────────────────────────────────────────────
  writeJSON( RANKING_PATH, { champion, aspirant } );
  writeJSON( SNAPSHOT_PATH, snapshots, true );
  writeJSON( HISTORY_PATH, updatedHistory, true );

  console.log( `\n✅ Concluído!` );
  console.log( `   ranking.json atualizado` );
  console.log( `   arena-history.json: +${newEntries.length} entrada(s)` );
}

main().catch( err => {
  console.error( '❌ Erro fatal:', err.message ?? err );
  process.exit( 1 );
} );