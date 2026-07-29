import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { BatchProvider } from './BatchContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <BatchProvider>
        <App />
      </BatchProvider>
    </HashRouter>
  </React.StrictMode>,
)
