import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import { AuthContext } from './auth-context'
import type { AuthContextValue } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

async function getAuthOrThrow() {
  const auth = await getFirebaseAuth()

  if (!auth) {
    throw new Error('Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.')
  }

  return auth
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    let unsubscribe = () => {}
    let isMounted = true

    getFirebaseAuth().then(async (auth) => {
      if (!auth || !isMounted) {
        return
      }

      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user)
        setIsLoading(false)
      })
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isConfigured: isFirebaseConfigured,
      isLoading,
      login: async (email, password) => {
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        await signInWithEmailAndPassword(await getAuthOrThrow(), email, password)
      },
      logout: async () => {
        const { signOut } = await import('firebase/auth')
        await signOut(await getAuthOrThrow())
      },
      register: async (name, email, password) => {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
        const credential = await createUserWithEmailAndPassword(
          await getAuthOrThrow(),
          email,
          password,
        )
        await updateProfile(credential.user, { displayName: name })
        setCurrentUser(credential.user)
      },
    }),
    [currentUser, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
