import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route path="about" element={<h1>About</h1>} />
            </Route>
            <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
    </BrowserRouter>
)
