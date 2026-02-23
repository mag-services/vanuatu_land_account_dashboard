import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import LandCoverApp from './LandCoverApp'
import './highcharts-config'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandCoverApp />} />
        <Route path="/courts" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
