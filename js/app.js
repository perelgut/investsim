/**
 * @file app.js
 * @description Application entry point — minimal bootstrap for Phase 1 testing.
 *              Full implementation in Task 2.3 when routing is wired up.
 *
 * @author Development Team
 * @date March 2026
 */

'use strict';

import { renderLoginForm } from './views/auth-view.js';
import { renderNavBar } from './components/nav-bar.js';
import { getAuthState } from './services/auth-service.js';

const app = document.getElementById('app');

// Show nav bar when user is signed in, login form when signed out
getAuthState((user) => {
  if (user) {
    // Remove existing nav if present
    const existingNav = document.getElementById('nav-bar');
    if (existingNav) existingNav.remove();

    // Prepend nav bar to body
    document.body.prepend(renderNavBar(user));
    app.innerHTML = `<p style="padding:32px">Signed in as <strong>${user.displayName}</strong>. Use the Logout button above.</p>`;
  } else {
    // Remove nav bar if present
    const existingNav = document.getElementById('nav-bar');
    if (existingNav) existingNav.remove();

    app.replaceChildren(renderLoginForm());
  }
});
