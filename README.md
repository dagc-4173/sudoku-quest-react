# Sudoku Quest TdeA

Aplicacion web academica de Mini Sudoku 6x6 desarrollada con React, Vite,
TypeScript, Context API, React Router DOM, Firebase Authentication y Firestore.

Desarrollador: Diego Alexander Gutierrez Cardona  
Modalidad: Individual  
Juego seleccionado: Mini Sudoku 6x6  
Entrega objetivo: 20 de mayo

## Stack

- React
- Vite
- TypeScript
- Context API
- React Router DOM
- Firebase Authentication
- Firestore
- CSS separado por componente y estilos globales

## Funcionalidades implementadas

- Rutas principales: `/`, `/game`, `/result`, `/login`, `/register`, `/leaderboard`.
- Arquitectura por dominio con `features/sudoku` y `features/leaderboard`.
- `SudokuContext` con `useReducer` para estado global del juego.
- AuthContext para sesion de usuario con Firebase Authentication.
- Rutas privadas para `/game`, `/result` y `/leaderboard` cuando Firebase esta configurado.
- Mini Sudoku 6x6 con bloques de 2 filas por 3 columnas.
- Generador de puzzle con solucion unica usando backtracking y contador de soluciones.
- Dificultades: Facil, Medio y Dificil.
- Entrada por selector visual y teclado fisico.
- Validacion manual mediante boton `Validar`.
- Marcado visual de celdas incorrectas sin borrar valores.
- Sistema de pistas.
- Temporizador de partida.
- Resultado con tiempo, errores, pistas y puntaje.
- Ranking en tiempo real con Firestore, filtrado por dificultad.

## Reglas del juego

- El tablero tiene 6 filas y 6 columnas.
- Cada fila debe contener los numeros del 1 al 6 sin repetirse.
- Cada columna debe contener los numeros del 1 al 6 sin repetirse.
- Cada bloque 2x3 debe contener los numeros del 1 al 6 sin repetirse.
- Las celdas fijas no se pueden modificar.
- La validacion solo ocurre al presionar `Validar`.
- La partida termina cuando el tablero esta completo y correcto.

## Puntaje

El tiempo se mantiene como campo independiente para ordenar el ranking por
menor duracion. La columna de puntaje usa mayor puntaje como mejor resultado.

```ts
finalScore =
  baseScore -
  Math.floor(timeInSeconds / 60) * 50 -
  mistakes * 100 -
  hintsUsed * 250 +
  noMistakeBonus +
  noHintBonus +
  speedBonus
```

Base por dificultad: Facil 1000, Medio 2000, Dificil 3000.

Penalizaciones:

- Cada minuto completo resta 50 puntos.
- Cada error resta 100 puntos.
- Cada pista resta 250 puntos.

Bonificaciones:

- Sin errores: 300 puntos.
- Sin pistas: 300 puntos.
- Rapidez no acumulable: 600 puntos hasta 30 segundos, 500 hasta 60,
  400 hasta 90, 300 hasta 120, 200 hasta 150 y 100 hasta 180.

## Estructura principal

```text
src/
  components/
    Button/
    Layout/
    Navbar/
  context/
    SudokuContext.tsx
    sudoku-context.ts
  contexts/
    AuthContext.tsx
    auth-context.ts
    useAuth.ts
  features/
    leaderboard/
      components/
      services/
    sudoku/
      components/
      hooks/
      services/
      types/
      utils/
  lib/
    firebase.ts
  pages/
  routers/
  styles/
```

## Comandos

Instalar dependencias:

```powershell
npm.cmd install
```

Ejecutar en desarrollo:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Validar lint:

```powershell
npm.cmd run lint
```

Compilar:

```powershell
npm.cmd run build
```

## Firebase

El archivo `.env` no debe subirse al repositorio. Usa `.env.example` como guia:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

La guia completa esta en [docs/firebase-setup.md](docs/firebase-setup.md).
La checklist de segunda entrega esta en
[docs/second-delivery-checklist.md](docs/second-delivery-checklist.md).

## Firestore

Coleccion: `scores`

Documento esperado:

```ts
{
  uid: string
  playerName: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeInSeconds: number
  mistakes: number
  hintsUsed: number
  finalScore: number
  createdAt: serverTimestamp()
}
```

## Verificacion de entrega

Antes de entregar:

```powershell
npm.cmd run lint
npm.cmd run build
```

Prueba manual recomendada:

1. Configurar Firebase y desplegar reglas.
2. Registrar un usuario.
3. Iniciar sesion.
4. Crear una partida.
5. Completar el Sudoku.
6. Validar el tablero.
7. Revisar resultado.
8. Confirmar que el ranking se actualiza por dificultad.
