// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { runMigrationIfNeeded } from '@/hooks/migrateLegacy'
import App from './App.tsx'
import './index.css'

// Roda migração silenciosa antes de qualquer render
runMigrationIfNeeded()

document.documentElement.classList.add("dark");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)