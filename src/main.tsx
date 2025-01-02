import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { Dashboard } from './views/Dashboard/Dashboard.tsx'
import { Login } from './views/Login/Login.tsx'
import './assets/normalize.less'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Dashboard />} />
        <Route path="product" element={<h1>Product</h1>} />
        <Route path="productType" element={<h1>Product Type</h1>} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>,
)
