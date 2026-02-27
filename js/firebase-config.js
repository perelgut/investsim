// =============================================================
// js/firebase-config.js
// Firebase SDK initialisation
// Reads all config values from environment variables injected
// at build time by GitHub Actions. Never hardcode credentials.
// Author: Development Team
// Date:   2026-03-01
// Dependencies: Firebase SDK v10
// =============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  connectAuthEmulator,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Firebase configuration ────────────────────────────────────
// Values are injected by GitHub Actions at deploy time.
// For local development, values are read from the .env file
// via a build step or substituted manually during development.
const firebaseConfig = {
  apiKey: '%%FIREBASE_API_KEY%%',
  authDomain: '%%FIREBASE_AUTH_DOMAIN%%',
  projectId: '%%FIREBASE_PROJECT_ID%%',
  storageBucket: '%%FIREBASE_STORAGE_BUCKET%%',
  messagingSenderId: '%%FIREBASE_MESSAGING_SENDER_ID%%',
  appId: '%%FIREBASE_APP_ID%%',
};

// ── Initialise Firebase ───────────────────────────────────────
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Emulator connection ───────────────────────────────────────
// Connect to local emulators when running in development.
// The USE_EMULATOR flag is injected at build time.
// In production this block is skipped entirely.
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: false });
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.info('[firebase-config] Connected to local emulators.');
}

// ── Exports ───────────────────────────────────────────────────
export { app, auth, db };
