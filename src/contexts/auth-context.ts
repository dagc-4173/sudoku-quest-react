import { createContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextValue {
  currentUser: User | null
  isConfigured: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
