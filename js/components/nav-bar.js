/**
 * @file nav-bar.js
 * @description Navigation bar component for InvestSim. Renders role-appropriate
 *              navigation links and a logout button for all authenticated users.
 *
 *              Full implementation in Task 2.4. This stub provides the logout
 *              button wired to logoutUser() for Phase 1 testing.
 *
 * @module nav-bar
 * @author Development Team
 * @date March 2026
 * @dependencies auth-service.js, router.js (stub)
 */

'use strict';

import { logoutUser } from '../services/auth-service.js';

// Temporary navigate stub — replaced by router.js import in Task 2.1
const navigate = (path) => {
  window.location.hash = path;
};

// ---------------------------------------------------------------------------
// Nav Bar — Stub
// ---------------------------------------------------------------------------

/**
 * Creates and returns a minimal navigation bar element containing only
 * the application name and a logout button. Full role-aware navigation
 * is implemented in Task 2.4.
 *
 * @param {import('firebase/auth').User} user - The currently signed-in Firebase user.
 * @returns {HTMLElement} The assembled nav bar element.
 *
 * @example
 *   const nav = renderNavBar(currentUser);
 *   document.body.prepend(nav);
 */
const renderNavBar = (user) => {
  const nav = document.createElement('nav');
  nav.className = 'nav-bar';
  nav.id = 'nav-bar';

  nav.innerHTML = `
    <div class="nav-brand">InvestSim</div>
    <div class="nav-user">
      <span
        class="nav-display-name"
        title="Signed in as ${user?.displayName ?? user?.email ?? 'Unknown'}"
      >
        ${user?.displayName ?? user?.email ?? 'Unknown'}
      </span>
      <button
        type="button"
        id="logout-btn"
        class="btn btn-logout"
        title="Sign out of InvestSim"
      >
        Logout
      </button>
    </div>
  `;

  nav.querySelector('#logout-btn').addEventListener('click', handleLogout);

  return nav;
};

// ---------------------------------------------------------------------------
// Logout Handler
// ---------------------------------------------------------------------------

/**
 * Handles the logout button click. Calls logoutUser from auth-service.js,
 * then redirects to the login screen on success.
 *
 * @returns {Promise<void>}
 */
const handleLogout = async () => {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Signing out…';
  }

  const { success, error } = await logoutUser();

  if (!success) {
    console.error('[nav-bar] Logout failed:', error);
    if (logoutBtn) {
      logoutBtn.disabled = false;
      logoutBtn.textContent = 'Logout';
    }
    return;
  }

  navigate('/login');
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { renderNavBar };
