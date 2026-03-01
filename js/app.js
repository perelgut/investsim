/**
 * @file app.js
 * @description Application entry point — minimal bootstrap for Phase 1 testing.
 *              Full implementation in Task 2.3 when routing is wired up.
 *
 * @author Development Team
 * @date March 2026
 */

'use strict';

import { renderRegistrationForm } from './views/auth-view.js';

// Temporary: render the registration form directly into #app
// This will be replaced by the router in Task 2.1
const app = document.getElementById('app');
app.replaceChildren(renderRegistrationForm());
