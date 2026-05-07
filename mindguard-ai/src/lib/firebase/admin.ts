import * as admin from 'firebase-admin';

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
        admin.initializeApp(); // Fallback
      }
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing. Using default credentials.");
      admin.initializeApp();
    }
  }
  return admin;
}
