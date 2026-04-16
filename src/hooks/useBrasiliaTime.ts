// src/hooks/useBrasiliaTime.ts

import { useState, useEffect, useRef } from 'react'

// Converte qualquer timestamp (ms) para o horário de Brasília
function toBrasilia( ms: number ): Date {
  return new Date(
    new Date( ms ).toLocaleString( 'en-US', { timeZone: 'America/Sao_Paulo' } )
  )
}

// Fallback: horário local convertido para Brasília (comportamento antigo)
export function getBrasiliaDate(): Date {
  return toBrasilia( Date.now() )
}

// Offset calculado após sync com servidor (compartilhado entre instâncias)
let serverOffsetMs = 0

async function syncWithServer() {
  try {
    const fetchStart = Date.now()
    const res = await fetch(
      'https://worldtimeapi.org/api/timezone/America/Sao_Paulo',
      { cache: 'no-store' }
    )
    const fetchEnd = Date.now()
    if ( !res.ok ) throw new Error( `HTTP ${res.status}` )

    const data = await res.json()
    const latency = ( fetchEnd - fetchStart ) / 2
    serverOffsetMs = data.unixtime * 1000 + latency - fetchEnd
  } catch ( err ) {
    console.warn( '[useBrasiliaTime] fallback para relógio local:', err )
    serverOffsetMs = 0
  }
}

export function useBrasiliaTime(): Date {
  const [ now, setNow ] = useState<Date>( getBrasiliaDate )
  const syncedRef = useRef( false )

  useEffect( () => {
    // Sincroniza com servidor uma vez na montagem
    if ( !syncedRef.current ) {
      syncedRef.current = true
      syncWithServer()
    }

    // Re-sincroniza a cada 5 minutos
    const resyncId = setInterval( syncWithServer, 5 * 60 * 1000 )

    // Tick a cada segundo usando o offset corrigido
    const tickId = setInterval( () => {
      setNow( toBrasilia( Date.now() + serverOffsetMs ) )
    }, 1000 )

    return () => {
      clearInterval( tickId )
      clearInterval( resyncId )
    }
  }, [] )

  return now
}