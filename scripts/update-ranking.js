// scripts/update-ranking.js
//
// Usage: node scripts/update-ranking.js public/ranking-new.json
//
// Saves a snapshot to ranking-snapshots.json whenever a new arena is detected
// (any player gained ≥1 win).  The snapshot is labelled with the nearest
// previous arena slot (13:00 / 19:00 / 20:30 / 23:00 BRT), not the exact
// clock time — so the UI always shows a clean arena label.
//
// Keeps at most MAX_DAYS days of snapshots.

import fs from 'fs';
import path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const MAX_DAYS = 3;
const BRT_OFFSET = -3; // UTC-3

// Fixed arena schedule in BRT (HH:MM)
const ARENA_SLOTS = [ '13:00', '19:00', '20:30', '23:00' ];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toBRT( date ) {
  return new Date( date.getTime() + BRT_OFFSET * 60 * 60 * 1000 );
}

function brtDateStr( date ) {
  return toBRT( date ).toISOString().slice( 0, 10 );
}

/**
 * Given a Date, returns the label of the most recent arena slot that has
 * already started (in BRT).  If we are before the first slot of the day
 * (e.g. 09:00 BRT), wraps around to the last slot of the previous day
 * (23:00), because that was the last arena that actually ran.
 */
function getNearestPreviousSlot( date ) {
  const brt = toBRT( date );
  const nowMinutes = brt.getUTCHours() * 60 + brt.getUTCMinutes();

  const slotMinutes = ARENA_SLOTS.map( s => {
    const [ h, m ] = s.split( ':' ).map( Number );
    return h * 60 + m;
  } );

  // Walk backwards to find the latest slot ≤ current BRT time
  for ( let i = slotMinutes.length - 1; i >= 0; i-- ) {
    if ( slotMinutes[ i ] <= nowMinutes ) {
      return ARENA_SLOTS[ i ];
    }
  }

  // Before 13:00 BRT → last arena was yesterday's 23:00
  return ARENA_SLOTS[ ARENA_SLOTS.length - 1 ];
}

function buildMap( list ) {
  const m = {};
  for ( const p of ( list || [] ) ) m[ p.charName ] = p;
  return m;
}

function hasNewWins( newList, prevList ) {
  const prevMap = buildMap( prevList );
  return ( newList || [] ).some( p => {
    const prev = prevMap[ p.charName ];
    return p.wins > ( prev ? prev.wins : 0 );
  } );
}

function readJSON( filePath, fallback ) {
  try { return JSON.parse( fs.readFileSync( filePath, 'utf8' ) ); }
  catch { return fallback; }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const [ , , newRankingPath ] = process.argv;
if ( !newRankingPath ) {
  console.error( 'Usage: node update-ranking.js <path-to-ranking-new.json>' );
  process.exit( 1 );
}

const dir = path.resolve( path.dirname( newRankingPath ) );
const rankingPath = path.join( dir, 'ranking.json' );
const snapshotsPath = path.join( dir, 'ranking-snapshots.json' );

const newRanking = JSON.parse( fs.readFileSync( newRankingPath, 'utf8' ) );

let snapshots = readJSON( snapshotsPath, [] );
if ( !Array.isArray( snapshots ) ) snapshots = [];

const lastSnap = snapshots.length > 0 ? snapshots[ snapshots.length - 1 ] : null;

const champNew = hasNewWins( newRanking.champion, lastSnap?.champion );
const aspirNew = hasNewWins( newRanking.aspirant, lastSnap?.aspirant );
const newArena = !lastSnap || champNew || aspirNew;

const now = new Date();

if ( newArena ) {
  const slotLabel = getNearestPreviousSlot( now );
  const date = brtDateStr( now );

  console.log( `[update-ranking] New arena detected → ${date} ${slotLabel} (UTC: ${now.toISOString()})` );

  snapshots.push( {
    timestamp: now.toISOString(),
    slotLabel,
    date,
    champion: newRanking.champion || [],
    aspirant: newRanking.aspirant || [],
  } );

  // Prune entries older than MAX_DAYS
  const cutoff = new Date( now );
  cutoff.setUTCDate( cutoff.getUTCDate() - MAX_DAYS );
  const before = snapshots.length;
  snapshots = snapshots.filter( s => new Date( s.timestamp ) >= cutoff );
  const pruned = before - snapshots.length;
  if ( pruned > 0 ) console.log( `[update-ranking] Pruned ${pruned} old snapshot(s).` );

  fs.writeFileSync( snapshotsPath, JSON.stringify( snapshots, null, 2 ) );
  console.log( `[update-ranking] ranking-snapshots.json updated (${snapshots.length} snapshots).` );
} else {
  console.log( '[update-ranking] No new arena detected. ranking-snapshots.json unchanged.' );
}

fs.writeFileSync( rankingPath, JSON.stringify( newRanking, null, 2 ) );
console.log( '[update-ranking] ranking.json updated.' );