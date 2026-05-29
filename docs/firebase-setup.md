# Firebase setup

Esta aplicacion usa Firebase Authentication con correo y contrasena, y Firestore
para guardar el ranking en tiempo real.

## 1. Crear el proyecto Firebase

1. Crear un proyecto en Firebase Console.
2. Agregar una aplicacion Web.
3. Activar Authentication > Sign-in method > Email/Password.
4. Crear una base de datos Firestore.

## 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y completar los valores de la app Web de Firebase:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Reinicia Vite despues de modificar `.env`.

## 3. Desplegar reglas de Firestore

El proyecto incluye:

- `firebase.json`
- `firestore.rules`

Comandos:

```bash
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules
```

Las reglas permiten lectura publica del ranking, creacion solo para usuarios
autenticados y bloquean edicion/eliminacion de puntajes.

## 4. Esquema de Firestore

Coleccion: `scores`

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

## 5. Indice para ranking

El ranking realtime consulta por dificultad y ordena por puntaje:

```ts
where('difficulty', '==', difficulty)
orderBy('finalScore', 'asc')
```

Firestore puede pedir un indice compuesto. Si aparece el error en consola,
abre el enlace que Firebase entrega y crea el indice con:

- Collection ID: `scores`
- Field 1: `difficulty` Ascending
- Field 2: `finalScore` Ascending

## 6. Prueba manual

1. Ejecutar `npm.cmd run dev -- --host 127.0.0.1 --port 5173`.
2. Registrar un usuario.
3. Iniciar sesion.
4. Completar un puzzle.
5. Presionar `Validar`.
6. Abrir `Ranking`.
7. Cambiar la dificultad y confirmar que la tabla se actualiza.
