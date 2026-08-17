import '@fontsource/anton/latin-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CareerProvider } from './app/CareerProvider'
import { getRouterBase } from './app/routerBase'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={getRouterBase()}>
      <CareerProvider>
        <App />
      </CareerProvider>
    </BrowserRouter>
  </StrictMode>,
)
