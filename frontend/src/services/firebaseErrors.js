const messages = {
  'auth/email-already-in-use': 'An account already exists with this email address.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak. Use at least 8 characters with upper/lowercase letters, a number, and a symbol.',
  'auth/wrong-password': 'The password is incorrect.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/user-not-found': 'No account was found for this email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase.',
  'auth/email-not-verified': 'Please verify your email before signing in.',
  'auth/expired-action-code': 'This password reset link has expired. Request a new one.',
  'auth/invalid-action-code': 'This password reset link is invalid or has already been used.',
  'auth/user-mismatch': 'This reset link belongs to a different account.',
  'auth/requires-recent-login': 'Please sign in again and retry this action.'
};

export function firebaseErrorMessage(error, fallback = 'Authentication failed. Please try again.') {
  return messages[error?.code] || error?.response?.data?.message || error?.message || fallback;
}
