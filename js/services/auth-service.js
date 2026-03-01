/**
 * @file auth-service.js
 * @description Encapsulates all Firebase Authentication operations and role
 *              claim management for the InvestSim application.
 *
 *              This module is the single point of contact for all
 *              authentication operations. No other module should import
 *              directly from the Firebase Auth SDK.
 *
 * @module auth-service
 * @author Development Team
 * @date March 2026
 * @dependencies firebase-config.js (auth instance)
 */

'use strict';

import { auth } from '../firebase-config.js';
// import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js';
// Add this import at the top of auth-service.js alongside existing imports
import { db } from '../firebase-config.js';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Creates a new student account in Firebase Authentication, writes the
 * corresponding users document to Firestore with role: 'student', and
 * triggers portfolio initialisation.
 *
 * @param {string} email       - The student's email address.
 * @param {string} password    - The student's chosen password (min 8 chars).
 * @param {string} displayName - The student's display name (max 50 chars).
 * @returns {Promise<{user: import('firebase/auth').User|null, error: string|null}>}
 *   Resolves with the created User object on success, or a plain-language
 *   error message on failure.
 *
 * @example
 *   const { user, error } = await registerUser('student@example.com', 'password123', 'Jane Smith');
 *   if (error) {
 *     showInlineError(error);
 *   } else {
 *     router.navigate('/dashboard');
 *   }
 */
const registerUser = async (email, password, displayName) => {
  try {
    // Step 1: Create the Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Set the display name on the Auth profile
    await updateProfile(user, { displayName });

    // Step 3: Write the users/{uid} Firestore document
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName,
      role: 'student',
      createdAt: serverTimestamp(),
    });

    // Step 4: Trigger portfolio initialisation
    // Full implementation in Task 1.6 (portfolio-service.js)
    // Stub: initPortfolio will be wired here once available
    // await initPortfolio(user.uid);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: mapAuthError(error.code) };
  }
};

// ---------------------------------------------------------------------------
// Auth Error Mapping
// ---------------------------------------------------------------------------

/**
 * Maps Firebase Authentication error codes to plain-language messages
 * suitable for display to students with no technical background.
 *
 * @param {string} code - Firebase error code (e.g. 'auth/email-already-in-use').
 * @returns {string} A plain-language error message.
 */
const mapAuthError = (code) => {
  const errors = {
    'auth/email-already-in-use':
      'An account with this email address already exists. Try logging in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Your password must be at least 8 characters long.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed':
      'A network error occurred. Please check your connection and try again.',
  };

  return errors[code] ?? 'Something went wrong. Please try again.';
};

// Add registerUser to exports
export { getAuthState, getCurrentUserRole, registerUser };

// ---------------------------------------------------------------------------
// Auth State Listener
// ---------------------------------------------------------------------------

/**
 * Attaches a Firebase onAuthStateChanged listener and calls the provided
 * callback whenever the authentication state changes (sign-in, sign-out,
 * or token refresh).
 *
 * @param {function(import('firebase/auth').User|null): void} callback -
 *   Called with the Firebase User object when signed in, or null when
 *   signed out.
 * @returns {function(): void} Unsubscribe function — call it to detach the
 *   listener when the view that registered it is unmounted.
 *
 * @example
 *   const unsubscribe = getAuthState((user) => {
 *     if (user) {
 *       console.log('Signed in:', user.email);
 *     } else {
 *       console.log('Signed out');
 *     }
 *   });
 *
 *   // Later, when cleaning up:
 *   unsubscribe();
 */
const getAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ---------------------------------------------------------------------------
// Role Claim Retrieval
// ---------------------------------------------------------------------------

/**
 * Retrieves the role custom claim from the current user's Firebase ID token.
 *
 * Forces a token refresh (forceRefresh: true) to guarantee the most current
 * claims are returned rather than a cached token. This is important after a
 * role change, which only takes effect once the token is refreshed.
 *
 * @returns {Promise<string|null>} Resolves with the role string —
 *   'student', 'administrator', or 'owner' — or null if no user is
 *   signed in or no role claim is present on the token.
 *
 * @example
 *   const role = await getCurrentUserRole();
 *   if (role === 'student') {
 *     router.navigate('/dashboard');
 *   }
 */
const getCurrentUserRole = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  try {
    const idTokenResult = await user.getIdTokenResult(true);
    const role = idTokenResult.claims.role;

    if (!role) {
      console.warn(
        '[auth-service] getCurrentUserRole: no role claim found on token for user',
        user.uid
      );
      return null;
    }

    return role;
  } catch (error) {
    console.error(
      '[auth-service] getCurrentUserRole: failed to retrieve ID token result.',
      error.message
    );
    return null;
  }
};
