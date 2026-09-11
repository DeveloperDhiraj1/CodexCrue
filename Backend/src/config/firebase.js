const { getApp, getApps, initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const config = require('./env');

let firebaseApp;

function configurationError(message) {
  const error = new Error(message);
  error.code = 'app/invalid-credential';
  return error;
}

function getFirebaseAdminCredential() {
  const missing = [
    ['FIREBASE_PROJECT_ID', config.firebaseProjectId],
    ['FIREBASE_CLIENT_EMAIL', config.firebaseClientEmail],
    ['FIREBASE_PRIVATE_KEY', config.firebasePrivateKey]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw configurationError(`Missing Firebase Admin environment variable(s): ${missing.join(', ')}`);
  }

  const pemPattern = /^-----BEGIN PRIVATE KEY-----\s+[\s\S]+?\s+-----END PRIVATE KEY-----$/;
  if (!pemPattern.test(config.firebasePrivateKey)) {
    throw configurationError(
      'Invalid FIREBASE_PRIVATE_KEY format: expected a PEM value containing ' +
      '-----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----.'
    );
  }

  return cert({
    projectId: config.firebaseProjectId,
    clientEmail: config.firebaseClientEmail,
    privateKey: config.firebasePrivateKey
  });
}

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  const credential = getFirebaseAdminCredential();

  firebaseApp = getApps().length > 0
    ? getApp()
    : initializeApp({ credential });
  return firebaseApp;
}

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

module.exports = { getFirebaseApp, getFirebaseAuth };
