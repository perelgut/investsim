/**
 * @file setup-owner.js
 * @description ONE-TIME setup script that creates the Owner account in Firebase
 *              Authentication and writes the corresponding Firestore users document.
 *
 *              !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *              !! WARNING: THIS SCRIPT MUST ONLY BE RUN ONCE.                   !!
 *              !! Running it a second time against a project that already has    !!
 *              !! an Owner account will fail gracefully, but you should never    !!
 *              !! need to run it again. If you need to reset the Owner account,  !!
 *              !! delete the existing account manually in the Firebase Console   !!
 *              !! or via the emulator UI first.                                  !!
 *              !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * @usage
 *   Against the Firebase Emulator (recommended for testing first):
 *     FIRESTORE_EMULATOR_HOST=localhost:8080 \
 *     FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
 *     node scripts/setup-owner.js
 *
 *   Against the live Firebase project:
 *     node scripts/setup-owner.js
 *
 *   Required environment variables (set in local .env — never commit real values):
 *     OWNER_EMAIL       — the email address for the Owner account
 *     OWNER_PASSWORD    — the password for the Owner account
 *     GOOGLE_APPLICATION_CREDENTIALS — path to your Firebase service account JSON key
 *       OR set FIREBASE_PROJECT_ID if using Application Default Credentials
 *
 * @author   Development Team
 * @date     March 2026
 * @dependencies firebase-admin (dev dependency)
 */

'use strict';

// ---------------------------------------------------------------------------
// Load environment variables from .env (if dotenv is available)
// ---------------------------------------------------------------------------
try {
  // dotenv is optional — if not installed, env vars must be set in the shell
  require('dotenv').config();
} catch (_e) {
  console.log('[setup-owner] dotenv not found — reading env vars from shell environment.');
}

const admin = require('firebase-admin');

// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------

/**
 * Reads and validates all required environment variables before any Firebase
 * calls are made. Exits immediately with a non-zero code if any are missing.
 *
 * @returns {{ ownerEmail: string, ownerPassword: string }} Validated credentials.
 */
function validateEnvironment() {
  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPassword = process.env.OWNER_PASSWORD;

  const missing = [];
  if (!ownerEmail) missing.push('OWNER_EMAIL');
  if (!ownerPassword) missing.push('OWNER_PASSWORD');

  if (missing.length > 0) {
    console.error(
      `[setup-owner] ERROR: The following required environment variables are not set: ${missing.join(', ')}`
    );
    console.error('[setup-owner] Set them in your local .env file and try again.');
    console.error('[setup-owner] NEVER commit real credentials to the repository.');
    process.exit(1);
  }

  return { ownerEmail, ownerPassword };
}

// ---------------------------------------------------------------------------
// Emulator detection
// ---------------------------------------------------------------------------

/**
 * Returns true if the script is targeting the Firebase Local Emulator Suite,
 * detected by the presence of the standard emulator environment variables.
 *
 * @returns {boolean} True if running against the emulator.
 */
function isEmulatorMode() {
  return !!(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);
}

// ---------------------------------------------------------------------------
// Firebase Admin SDK initialisation
// ---------------------------------------------------------------------------

/**
 * Initialises the Firebase Admin SDK.
 *
 * - In emulator mode: uses a dummy project ID and connects to the local
 *   emulator endpoints automatically (via FIRESTORE_EMULATOR_HOST and
 *   FIREBASE_AUTH_EMULATOR_HOST environment variables).
 * - In production mode: uses Application Default Credentials or the service
 *   account key file pointed to by GOOGLE_APPLICATION_CREDENTIALS.
 *
 * @returns {admin.app.App} The initialised Firebase Admin app instance.
 */
function initFirebase() {
  if (isEmulatorMode()) {
    console.log('[setup-owner] Emulator mode detected — connecting to local Firebase emulators.');
    console.log(
      `[setup-owner]   Auth emulator:      ${process.env.FIREBASE_AUTH_EMULATOR_HOST || 'not set (using default 9099)'}`
    );
    console.log(
      `[setup-owner]   Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST || 'not set (using default 8080)'}`
    );

    return admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'investsim-emulator',
      credential: admin.credential.applicationDefault(),
    });
  }

  console.log('[setup-owner] Production mode — connecting to live Firebase project.');

  // In production, GOOGLE_APPLICATION_CREDENTIALS must point to a service
  // account JSON key file, OR the environment must support Application
  // Default Credentials (e.g. Cloud Run, Cloud Functions).
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// ---------------------------------------------------------------------------
// Core: create the Owner Auth account
// ---------------------------------------------------------------------------

/**
 * Creates the Owner user account in Firebase Authentication.
 *
 * If an account with the given email already exists, this function detects
 * the error and exits with a clear message rather than throwing.
 *
 * @param {import('firebase-admin/auth').Auth} auth  - Firebase Auth Admin instance.
 * @param {string} email    - Owner account email address.
 * @param {string} password - Owner account password.
 * @returns {Promise<import('firebase-admin/auth').UserRecord>} The created user record.
 */
async function createOwnerAuthAccount(auth, email, password) {
  console.log(`[setup-owner] Step 1: Creating Firebase Auth account for ${email} ...`);

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: 'Owner',
      emailVerified: false,
    });

    console.log(`[setup-owner]   ✓ Auth account created. UID: ${userRecord.uid}`);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.error(
        '[setup-owner] ERROR: An account with this email already exists in Firebase Auth.'
      );
      console.error('[setup-owner] This script has likely already been run against this project.');
      console.error(
        '[setup-owner] If you need to re-run it, delete the existing Owner account first.'
      );
    } else {
      console.error(`[setup-owner] ERROR creating Auth account: ${error.message}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Core: set the Owner custom claim
// ---------------------------------------------------------------------------

/**
 * Sets the custom claim { role: "owner" } on the newly created Auth account.
 * This claim is read by the client-side auth-service.js getCurrentUserRole()
 * function and by Firestore Security Rules to enforce access control.
 *
 * @param {import('firebase-admin/auth').Auth} auth - Firebase Auth Admin instance.
 * @param {string} uid - The UID of the Owner user.
 * @returns {Promise<void>}
 */
async function setOwnerCustomClaim(auth, uid) {
  console.log('[setup-owner] Step 2: Setting custom claim { role: "owner" } ...');

  try {
    await auth.setCustomUserClaims(uid, { role: 'owner' });
    console.log('[setup-owner]   ✓ Custom claim set successfully.');
  } catch (error) {
    console.error(`[setup-owner] ERROR setting custom claim: ${error.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Core: write the Firestore users document
// ---------------------------------------------------------------------------

/**
 * Writes the Owner's document to the Firestore users collection.
 * Document path: users/{uid}
 *
 * Fields written:
 *   - uid          {string}    Firebase Auth UID
 *   - email        {string}    Owner email address
 *   - displayName  {string}    "Owner"
 *   - role         {string}    "owner"
 *   - createdAt    {Timestamp} Server-side Firestore timestamp
 *
 * @param {import('firebase-admin/firestore').Firestore} db - Firestore Admin instance.
 * @param {string} uid   - The UID of the Owner user.
 * @param {string} email - Owner email address.
 * @returns {Promise<void>}
 */
async function writeOwnerFirestoreDocument(db, uid, email) {
  console.log(`[setup-owner] Step 3: Writing users/${uid} document to Firestore ...`);

  try {
    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName: 'Owner',
      role: 'owner',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('[setup-owner]   ✓ Firestore users document written successfully.');
  } catch (error) {
    console.error(`[setup-owner] ERROR writing Firestore document: ${error.message}`);
    console.error('[setup-owner] The Auth account and custom claim were created but the');
    console.error('[setup-owner] Firestore document was NOT written. You may need to write');
    console.error('[setup-owner] the document manually or delete the Auth account and re-run.');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Core: verify the setup
// ---------------------------------------------------------------------------

/**
 * Reads back the created Auth account and Firestore document to confirm
 * the setup completed correctly before the script exits.
 *
 * @param {import('firebase-admin/auth').Auth} auth        - Firebase Auth Admin instance.
 * @param {import('firebase-admin/firestore').Firestore} db - Firestore Admin instance.
 * @param {string} uid - The UID of the Owner user.
 * @returns {Promise<void>}
 */
async function verifySetup(auth, db, uid) {
  console.log('[setup-owner] Step 4: Verifying setup ...');

  try {
    // Verify Auth account and claim
    const userRecord = await auth.getUser(uid);
    const claims = userRecord.customClaims;

    if (!claims || claims.role !== 'owner') {
      throw new Error(`Custom claim not set correctly. Claims found: ${JSON.stringify(claims)}`);
    }
    console.log(
      `[setup-owner]   ✓ Auth account verified. Email: ${userRecord.email}, Claim role: ${claims.role}`
    );

    // Verify Firestore document
    const docSnap = await db.collection('users').doc(uid).get();

    if (!docSnap.exists) {
      throw new Error('Firestore users document does not exist after write.');
    }

    const data = docSnap.data();
    if (data.role !== 'owner' || data.uid !== uid) {
      throw new Error(`Firestore document data looks incorrect: ${JSON.stringify(data)}`);
    }
    console.log(
      `[setup-owner]   ✓ Firestore document verified. Role: ${data.role}, UID: ${data.uid}`
    );
  } catch (error) {
    console.error(`[setup-owner] VERIFICATION FAILED: ${error.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Main entry point. Orchestrates all setup steps in sequence.
 * Exits with code 0 on success, non-zero on any error.
 *
 * @returns {Promise<void>}
 */
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         InvestSim — Owner Account Setup Script               ║');
  console.log('║         RUN THIS SCRIPT EXACTLY ONCE PER PROJECT             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // 0. Validate environment
  const { ownerEmail, ownerPassword } = validateEnvironment();

  // 1. Initialise Firebase Admin SDK
  const app = initFirebase();
  const auth = admin.auth(app);
  const db = admin.firestore(app);

  // 2. Create Auth account
  const userRecord = await createOwnerAuthAccount(auth, ownerEmail, ownerPassword);
  const { uid } = userRecord;

  // 3. Set custom claim
  await setOwnerCustomClaim(auth, uid);

  // 4. Write Firestore document
  await writeOwnerFirestoreDocument(db, uid, ownerEmail);

  // 5. Verify everything looks correct
  await verifySetup(auth, db, uid);

  // 6. Done
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✓  Owner account setup COMPLETE                             ║');
  console.log(`║     UID:   ${uid.padEnd(51)}║`);
  console.log(`║     Email: ${ownerEmail.padEnd(51)}║`);
  console.log('║                                                              ║');
  console.log('║  Next step: Task 0.8 — Write project README                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  await app.delete();
  process.exit(0);
}

main().catch((error) => {
  console.error(`[setup-owner] UNEXPECTED ERROR: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
