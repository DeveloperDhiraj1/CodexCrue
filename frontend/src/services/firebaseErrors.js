const messages = {
  'auth/email-already-in-use': 'An account already exists with this email address.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak. Use at least 8 characters with upper/lowercase letters, a number, and a symbol.',
  'auth/password-does-not-meet-requirements': 'Password does not meet the Firebase password policy requirements.',
  'auth/wrong-password': 'The password is incorrect.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/user-not-found': 'No account was found for this email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/invalid-api-key': 'Firebase configuration is invalid. Check the VITE_FIREBASE_API_KEY value.',
  'auth/app-not-authorized': 'This app is not authorized for the configured Firebase project.',
  'auth/unauthorized-domain': 'This deployment domain is not authorized in Firebase Authentication.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/invalid-password': 'The password is invalid. Check it and try again.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase.',
  'auth/email-not-verified': 'Please verify your email before signing in.',
  'auth/expired-action-code': 'This password reset link has expired. Request a new one.',
  'auth/invalid-action-code': 'This password reset link is invalid or has already been used.',
  'auth/user-mismatch': 'This reset link belongs to a different account.',
  'auth/requires-recent-login': 'Please sign in again and retry this action.'
};

export function firebaseErrorMessage(error, fallback = 'Authentication failed. Please try again.') {
  console.error('[Firebase Auth Error]', {
    code: error?.code || 'unknown',
    message: error?.message || fallback,
    customData: error?.customData || undefined
  });
  return messages[error?.code] || error?.response?.data?.message || error?.message || fallback;
}
