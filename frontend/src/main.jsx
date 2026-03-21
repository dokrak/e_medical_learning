import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LangProvider } from './LangContext'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/elearning">
    <LangProvider>
      <App />
    </LangProvider>
  </BrowserRouter>
)
