import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let appPromise: Promise<FirebaseApp | null> | null = null
let authPromise: Promise<Auth | null> | null = null
let dbPromise: Promise<Firestore | null> | null = null

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    return Promise.resolve(null)
  }

  if (!appPromise) {
    appPromise = import('firebase/app').then(({ getApp, getApps, initializeApp }) =>
      getApps().length ? getApp() : initializeApp(firebaseConfig),
    )
  }

  return appPromise
}

export function getFirebaseAuth() {
  if (!authPromise) {
    authPromise = getFirebaseApp().then(async (app) => {
      if (!app) {
        return null
      }

      const { getAuth } = await import('firebase/auth')
      return getAuth(app)
    })
  }

  return authPromise
}

export function getFirebaseDb() {
  if (!dbPromise) {
    dbPromise = getFirebaseApp().then(async (app) => {
      if (!app) {
        return null
      }

      const { getFirestore } = await import('firebase/firestore')
      return getFirestore(app)
    })
  }

  return dbPromise
}
