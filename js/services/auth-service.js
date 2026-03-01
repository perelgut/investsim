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
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js';

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

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { getAuthState, getCurrentUserRole };
