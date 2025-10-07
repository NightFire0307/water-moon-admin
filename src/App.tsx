import { WithAuth } from './components/WithAuth.tsx'
import AdminLayout from './Layout/AdminLayout.tsx'
import './App.css'

function App() {
  return <AdminLayout />
}
export default WithAuth(App)
