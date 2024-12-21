import './App.css'
import {Outlet} from "react-router";

function App() {
    return <div>
        <h1>Home</h1>
        <Outlet />
    </div>
}
export default App
