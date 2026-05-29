type AuthAction = 'login' | 'register'

function getFirebaseErrorCode(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: unknown }).code

    if (typeof code === 'string') {
      return code
    }
  }

  return ''
}

export function getFirebaseAuthErrorMessage(error: unknown, action: AuthAction) {
  const code = getFirebaseErrorCode(error)

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado. Intenta iniciar sesión.'
    case 'auth/invalid-email':
      return 'El correo electrónico no tiene un formato válido.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'El registro con correo y contraseña no está habilitado en Firebase Authentication.'
    case 'auth/configuration-not-found':
      return 'Firebase Authentication aún no está inicializado para este proyecto. En Firebase Console entra a Authentication y activa Email/Password.'
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'La API key de Firebase no es válida. Revisa los valores reales del archivo .env.'
    case 'auth/app-not-authorized':
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado en Firebase Authentication. Agrega localhost en Authorized domains.'
    case 'auth/too-many-requests':
      return 'Firebase bloqueó temporalmente los intentos. Espera unos minutos y vuelve a probar.'
    case 'auth/network-request-failed':
      return 'No se pudo conectar con Firebase. Revisa tu conexión e inténtalo de nuevo.'
    default:
      break
  }

  if (action === 'login') {
    return code
      ? `No se pudo iniciar sesión. Código de Firebase: ${code}.`
      : 'No se pudo iniciar sesión. Revisa el correo y la contraseña.'
  }

  return code
    ? `No se pudo crear la cuenta. Código de Firebase: ${code}.`
    : 'No se pudo crear la cuenta. Usa otro correo o una contraseña más fuerte.'
}
