import { Gamepad2, Grid3x3, LogIn, LogOut, Trophy, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import './Navbar.css'

const mainLinks = [
  { to: '/', label: 'Inicio', Icon: Grid3x3 },
  { to: '/game', label: 'Juego', Icon: Gamepad2 },
  { to: '/leaderboard', label: 'Ranking', Icon: Trophy },
]

const authLinks = [
  { to: '/login', label: 'Ingresar', Icon: LogIn },
  { to: '/register', label: 'Registro', Icon: UserPlus },
]

function Navbar() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand" aria-label="Ir al inicio">
        <span className="navbar__brand-mark">SQ</span>
        <span className="navbar__brand-text">Sudoku Quest TdeA</span>
      </NavLink>

      <nav className="navbar__links" aria-label="Navegación principal">
        {mainLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <nav className="navbar__auth" aria-label="Acceso de usuario">
        {currentUser ? (
          <>
            <span className="navbar__user">{currentUser.displayName || currentUser.email}</span>
            <button
              className="navbar__link navbar__button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{isLoggingOut ? 'Saliendo...' : 'Salir'}</span>
            </button>
          </>
        ) : (
          authLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))
        )}
      </nav>
    </header>
  )
}

export default Navbar
