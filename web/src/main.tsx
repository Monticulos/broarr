import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@digdir/designsystemet-css'
import '@digdir/designsystemet-theme'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
