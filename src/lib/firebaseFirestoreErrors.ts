function getFirebaseErrorCode(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: unknown }).code

    if (typeof code === 'string') {
      return code
    }
  }

  return ''
}

export function getFirestoreSaveErrorMessage(error: unknown) {
  const code = getFirebaseErrorCode(error)

  switch (code) {
    case 'firestore/save-timeout':
      return 'Firestore tardó demasiado en responder. Revisa que la base de datos exista y que tengas conexión.'
    case 'permission-denied':
      return 'Firestore rechazó el guardado. Revisa que las reglas estén publicadas y que la sesión esté activa.'
    case 'unauthenticated':
      return 'La sesión expiró antes de guardar el resultado. Ingresa de nuevo y vuelve a jugar.'
    case 'failed-precondition':
      return 'Firestore requiere una configuración pendiente antes de guardar o leer el ranking.'
    case 'unavailable':
      return 'Firestore no está disponible en este momento. Intenta nuevamente en unos minutos.'
    default:
      return code
        ? `No se pudo guardar el resultado. Código de Firestore: ${code}.`
        : 'No se pudo guardar el resultado en el ranking.'
  }
}
