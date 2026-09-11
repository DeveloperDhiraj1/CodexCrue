const admin = require('firebase-admin');
const config = require('./env');

let firebaseApp;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  firebaseApp = admin.apps.length > 0
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebaseProjectId,
          clientEmail: config.firebaseClientEmail,
          privateKey: config.firebasePrivateKey
        })
      });
  return firebaseApp;
}

function getFirebaseAuth() {
  return admin.auth(getFirebaseApp());
}

module.exports = { getFirebaseApp, getFirebaseAuth };
