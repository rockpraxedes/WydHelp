// src/hooks/useEstoque.ts

import { useState, useCallback } from 'react'

const ESTOQUE_KEY = 'wyd_estoque_runas'

type Estoque = Record<string, number>

function loadEstoque(): Estoque {
  try {
    const raw = localStorage.getItem(ESTOQUE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

function saveEstoque(estoque: Estoque) {
  localStorage.setItem(ESTOQUE_KEY, JSON.stringify(estoque))
}

export function useEstoque() {
  const [estoque, setEstoque] = useState<Estoque>(loadEstoque)

  const setQuantidade = useCallback((runaId: string, quantidade: number) => {
    setEstoque(prev => {
      const next = { ...prev, [runaId]: Math.max(0, quantidade) }
      saveEstoque(next)
      return next
    })
  }, [])

  const incrementar = useCallback((runaId: string, delta = 1) => {
    setEstoque(prev => {
      const next = { ...prev, [runaId]: Math.max(0, (prev[runaId] ?? 0) + delta) }
      saveEstoque(next)
      return next
    })
  }, [])

  const quantidade = useCallback((runaId: string) => {
    return estoque[runaId] ?? 0
  }, [estoque])

  // Quantas vezes consigo craftar uma receita com o estoque atual
  const craftaveis = useCallback((runas: { runaId: string; quantidade: number }[]) => {
    if (!runas.length) return 0
    return Math.min(...runas.map(r => Math.floor((estoque[r.runaId] ?? 0) / r.quantidade)))
  }, [estoque])

  // Quais runas faltam para craftar N vezes
  const faltando = useCallback((runas: { runaId: string; quantidade: number }[], vezes = 1) => {
    return runas
      .map(r => ({
        runaId: r.runaId,
        falta: Math.max(0, r.quantidade * vezes - (estoque[r.runaId] ?? 0)),
      }))
      .filter(r => r.falta > 0)
  }, [estoque])

  return { estoque, setQuantidade, incrementar, quantidade, craftaveis, faltando }
}
