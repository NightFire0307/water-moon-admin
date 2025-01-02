import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App.tsx'
import { Dashboard } from './views/Dashboard/Dashboard.tsx'
import './assets/normalize.less'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/login" element={<h1>Login</h1>} />
    </Routes>
  </BrowserRouter>,
)
