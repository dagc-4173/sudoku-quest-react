import type { User } from 'firebase/auth'
import { getFirebaseDb } from '../lib/firebase'

export interface GameResultPayload {
  difficulty: string
  errors: number
  hints: number
  score: number
  time: string
  timeSeconds: number
}

export interface LeaderboardEntry extends GameResultPayload {
  id: string
  playerName: string
  userId: string
}

export async function saveGameResult(result: GameResultPayload, user: User | null) {
  const db = await getFirebaseDb()

  if (!db || !user) {
    return false
  }

  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')

  await addDoc(collection(db, 'scores'), {
    ...result,
    createdAt: serverTimestamp(),
    playerName: user.displayName || user.email || 'Jugador TdeA',
    userId: user.uid,
  })

  return true
}

export async function getLeaderboard() {
  const db = await getFirebaseDb()

  if (!db) {
    return []
  }

  const { collection, getDocs, limit, orderBy, query } = await import('firebase/firestore')
  const scoresQuery = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(10))
  const snapshot = await getDocs(scoresQuery)

  return snapshot.docs.map((doc) => {
    const data = doc.data()

    return {
      difficulty: String(data.difficulty ?? 'Mini Sudoku'),
      errors: Number(data.errors ?? 0),
      hints: Number(data.hints ?? 0),
      id: doc.id,
      playerName: String(data.playerName ?? 'Jugador TdeA'),
      score: Number(data.score ?? 0),
      time: String(data.time ?? '00:00'),
      timeSeconds: Number(data.timeSeconds ?? 0),
      userId: String(data.userId ?? ''),
    }
  })
}
