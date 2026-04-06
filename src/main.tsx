// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { runMigrationIfNeeded } from '@/utils/migrateLegacy.js'
import App from './App'
import './index.css'


document.documentElement.classList.add("dark");

runMigrationIfNeeded()
 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
 