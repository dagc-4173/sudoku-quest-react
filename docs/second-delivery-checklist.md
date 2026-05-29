# Checklist segunda entrega

Proyecto: Sudoku Quest TdeA  
Desarrollador: Diego Alexander Gutierrez Cardona  
Modalidad: Individual

## Estado funcional

- [x] App creada con React, Vite y TypeScript.
- [x] Arquitectura por dominio con Screaming Components.
- [x] Rutas principales: `/`, `/game`, `/result`.
- [x] Rutas preparadas: `/login`, `/register`, `/leaderboard`.
- [x] Context API para estado global de Sudoku y autenticacion.
- [x] Reducer para estado global del juego.
- [x] Custom hook `useSudoku`.
- [x] Mini Sudoku 6x6 con bloques de 2x3.
- [x] Generador de tableros desde cero con backtracking.
- [x] Solver con contador de soluciones para mantener solucion unica.
- [x] Dificultades Facil, Medio y Dificil.
- [x] Entrada por teclado fisico y selector visual.
- [x] Validacion manual con boton `Validar`.
- [x] Marcado visual de errores sin borrar valores.
- [x] Sistema de pistas.
- [x] Temporizador.
- [x] Resultado con tiempo, errores, pistas y puntaje.
- [x] Firebase Authentication con correo y contrasena.
- [x] Firestore para guardar partidas.
- [x] Ranking en tiempo real separado por dificultad.

## Verificacion tecnica

- [x] `.env` ignorado por Git.
- [x] `.env.example` sin credenciales reales.
- [x] Reglas de Firestore incluidas en `firestore.rules`.
- [x] Documentacion Firebase en `docs/firebase-setup.md`.
- [x] `npm.cmd run lint` ejecutado correctamente.
- [x] `npm.cmd run build` ejecutado correctamente.

## Evidencias sugeridas

- Captura de Home.
- Captura de registro de usuario.
- Captura de inicio de sesion.
- Captura de partida en curso.
- Captura de resultado.
- Captura de documentos `scores` en Firestore.
- Captura de ranking por dificultad.

## Pendiente opcional

- Agregar pruebas unitarias con Vitest para solver, validator, score y generator.
