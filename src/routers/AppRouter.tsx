import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/Layout/MainLayout'

const GamePage = lazy(() => import('../pages/GamePage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const ResultPage = lazy(() => import('../pages/ResultPage'))

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loader">Cargando...</div>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
