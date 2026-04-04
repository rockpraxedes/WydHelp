// src/hooks/useBrasiliaTime.ts

import { useState, useEffect } from 'react'

export function getBrasiliaDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
}

export function useBrasiliaTime(): Date {
  const [now, setNow] = useState<Date>(getBrasiliaDate)

  useEffect(() => {
    const id = setInterval(() => setNow(getBrasiliaDate()), 1000)
    return () => clearInterval(id)
  }, [])

  return now
}
