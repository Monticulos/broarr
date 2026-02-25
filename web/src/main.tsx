import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@digdir/designsystemet-css'
import '@digdir/designsystemet-theme'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
