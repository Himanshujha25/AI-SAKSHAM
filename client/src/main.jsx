import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// SentinelAI Security Command Center - Permanently Dark-First Cyber Theme
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
