const { getApp, getApps, initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const config = require('./env');

let firebaseApp;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  firebaseApp = getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: config.firebaseProjectId,
          clientEmail: config.firebaseClientEmail,
          privateKey: config.firebasePrivateKey
        })
      });
  return firebaseApp;
}

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

module.exports = { getFirebaseApp, getFirebaseAuth };
