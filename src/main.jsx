import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RootApp from './RootApp.jsx'
import { migrateFromLocalStorage } from './storage'
import { initPrendasCache } from './data/catalogos'

migrateFromLocalStorage()
  .then(() => initPrendasCache())
  .catch(console.warn)
  .then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <RootApp />
      </StrictMode>,
    )
  })
