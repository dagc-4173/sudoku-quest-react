import AppRouter from './routers/AppRouter'
import { SudokuProvider } from './context/SudokuContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <SudokuProvider>
        <AppRouter />
      </SudokuProvider>
    </AuthProvider>
  )
}

export default App
