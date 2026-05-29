import type { User } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/firestore'
import type { Difficulty } from '../../sudoku/types/sudoku.types'
import { formatTime } from '../../sudoku/utils/formatTime'
import { getFirebaseDb } from '../../../lib/firebase'

export interface GameResultPayload {
  difficulty: Difficulty
  finalScore: number
  hintsUsed: number
  mistakes: number
  timeInSeconds: number
}

export interface LeaderboardEntry extends GameResultPayload {
  id: string
  playerName: string
  time: string
  uid: string
}

const saveGameResultTimeoutMs = 8000

function withTimeout<T>(operation: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(Object.assign(new Error('Firestore save timeout'), { code: 'firestore/save-timeout' }))
    }, timeoutMs)

    operation
      .then((result) => {
        window.clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      })
  })
}

function mapLeaderboardEntry(id: string, data: Record<string, unknown>): LeaderboardEntry {
  const timeInSeconds = Number(data.timeInSeconds ?? 0)

  return {
    difficulty: String(data.difficulty ?? 'easy') as Difficulty,
    finalScore: Number(data.finalScore ?? 0),
    hintsUsed: Number(data.hintsUsed ?? 0),
    id,
    mistakes: Number(data.mistakes ?? 0),
    playerName: String(data.playerName ?? 'Jugador TdeA'),
    time: formatTime(timeInSeconds),
    timeInSeconds,
    uid: String(data.uid ?? ''),
  }
}

function sortLeaderboardEntries(entries: LeaderboardEntry[]) {
  return entries
    .sort((currentEntry, nextEntry) => {
      if (currentEntry.finalScore !== nextEntry.finalScore) {
        return currentEntry.finalScore - nextEntry.finalScore
      }

      if (currentEntry.timeInSeconds !== nextEntry.timeInSeconds) {
        return currentEntry.timeInSeconds - nextEntry.timeInSeconds
      }

      if (currentEntry.mistakes !== nextEntry.mistakes) {
        return currentEntry.mistakes - nextEntry.mistakes
      }

      return currentEntry.hintsUsed - nextEntry.hintsUsed
    })
    .slice(0, 10)
}

export async function saveGameResult(result: GameResultPayload, user: User | null) {
  const db = await getFirebaseDb()

  if (!db || !user) {
    return false
  }

  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')

  await withTimeout(
    addDoc(collection(db, 'scores'), {
      createdAt: serverTimestamp(),
      difficulty: result.difficulty,
      finalScore: result.finalScore,
      hintsUsed: result.hintsUsed,
      mistakes: result.mistakes,
      playerName: user.displayName || user.email || 'Jugador TdeA',
      timeInSeconds: result.timeInSeconds,
      uid: user.uid,
    }),
    saveGameResultTimeoutMs,
  )

  return true
}

export async function subscribeToLeaderboard(
  difficulty: Difficulty,
  onEntriesChange: (entries: LeaderboardEntry[]) => void,
  onError: (error: Error) => void,
) {
  const db = await getFirebaseDb()

  if (!db) {
    onEntriesChange([])
    return () => {}
  }

  const { collection, onSnapshot, query, where } = await import('firebase/firestore')
  const scoresQuery = query(
    collection(db, 'scores'),
    where('difficulty', '==', difficulty),
  )

  return onSnapshot(
    scoresQuery,
    (snapshot) => {
      onEntriesChange(
        sortLeaderboardEntries(
          snapshot.docs.map((doc) => mapLeaderboardEntry(doc.id, doc.data())),
        ),
      )
    },
    (error) => onError(error),
  )
}

export async function getLeaderboard(difficulty: Difficulty) {
  const db = await getFirebaseDb()

  if (!db) {
    return []
  }

  const { collection, getDocs, query, where } = await import('firebase/firestore')
  const scoresQuery = query(
    collection(db, 'scores'),
    where('difficulty', '==', difficulty),
  )
  const snapshot = await getDocs(scoresQuery)

  return sortLeaderboardEntries(
    snapshot.docs.map((doc) => mapLeaderboardEntry(doc.id, doc.data())),
  )
}

export type LeaderboardUnsubscribe = Unsubscribe
