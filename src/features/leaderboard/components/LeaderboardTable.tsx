import { Link } from 'react-router-dom'
import { getDifficultyLabel } from '../../sudoku/utils/difficultyConfig'
import type { LeaderboardEntry } from '../services/leaderboardService'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  isLoading: boolean
}

function LeaderboardTable({ entries, isLoading }: LeaderboardTableProps) {
  return (
    <div className="table-shell" role="region" aria-label="Ranking de Sudoku">
      <table>
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Dificultad</th>
            <th>Tiempo</th>
            <th>Errores</th>
            <th>Pistas</th>
            <th>Puntaje</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6}>Cargando ranking...</td>
            </tr>
          ) : entries.length ? (
            entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.playerName}</td>
                <td>{getDifficultyLabel(entry.difficulty)}</td>
                <td>{entry.time}</td>
                <td>{entry.mistakes}</td>
                <td>{entry.hintsUsed}</td>
                <td>{entry.finalScore}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                Aún no hay partidas registradas. <Link to="/game">Juega la primera.</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default LeaderboardTable
