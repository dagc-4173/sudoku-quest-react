import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import './MainLayout.css'

function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
