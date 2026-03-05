/**
 * @file router.js
 * @description Client-side hash router for InvestSim. Listens for hashchange
 *              events and dispatches to registered route handlers based on the
 *              current URL hash fragment.
 *
 *              Routes are registered with addRoute(path, handler, allowedRoles)
 *              where path may contain named parameters prefixed with ':' (e.g.
 *              '/admin/:userId'). Named parameters are extracted and passed to
 *              the handler as an object.
 *
 *              Route guards are enforced at dispatch time by the internal
 *              guardRoute() function. An unauthenticated user is always
 *              redirected to /login. An authenticated user attempting to access
 *              a route outside their role is redirected to their role's default
 *              route (/dashboard for student, /admin for administrator,
 *              /owner for owner).
 *
 * @module router
 * @author Stephen Perelgut and Claude.ai
 * @date March 2026
 * @dependencies js/services/auth-service.js (getCurrentUserRole)
 */

'use strict';

import { getCurrentUserRole } from './services/auth-service.js';

// ---------------------------------------------------------------------------
// Role Default Routes
// ---------------------------------------------------------------------------

/**
 * Maps each role string to the route the user is redirected to when they
 * attempt to access a route that does not permit their role.
 *
 * @type {Object<string, string>}
 */
const ROLE_DEFAULT_ROUTES = {
  student: '/dashboard',
  administrator: '/admin',
  owner: '/owner',
};

// ---------------------------------------------------------------------------
// Route Registry
// ---------------------------------------------------------------------------

/**
 * Internal registry of all registered routes.
 * Each entry stores the original path pattern, a compiled RegExp for matching,
 * an array of parameter names extracted from the pattern, the handler, and
 * the array of roles permitted to access the route.
 *
 * An empty allowedRoles array means the route is publicly accessible
 * (i.e. /login and /register — no authentication required).
 *
 * @type {Array<{
 *   pattern:      string,
 *   regex:        RegExp,
 *   paramNames:   string[],
 *   handler:      function(Object): void,
 *   allowedRoles: string[]
 * }>}
 */
const routes = [];

// ---------------------------------------------------------------------------
// Route Registration
// ---------------------------------------------------------------------------

/**
 * Registers a route handler for the given path pattern.
 *
 * Path patterns may include named parameters prefixed with ':'.
 * Named parameters match any non-slash segment and are passed to the
 * handler as properties of the params object.
 *
 * Pass an empty allowedRoles array (or omit it) for routes that are
 * publicly accessible without authentication, such as /login and /register.
 *
 * @param {string}   path         - Route path pattern (e.g. '/dashboard',
 *                                  '/admin/:userId').
 * @param {function(params: Object): void} handler - Function called when the
 *   route is matched and the guard permits access. Receives an object of
 *   extracted named parameters.
 * @param {string[]} [allowedRoles=[]] - Roles permitted to access this route.
 *   Use an empty array for public routes (no auth required).
 * @returns {void}
 *
 * @example
 *   addRoute('/dashboard', renderDashboard,  ['student']);
 *   addRoute('/admin',     renderAdmin,       ['administrator', 'owner']);
 *   addRoute('/login',     renderLogin,       []);   // public
 */
const addRoute = (path, handler, allowedRoles = []) => {
  // Convert path pattern to a RegExp.
  // ':paramName' segments become unnamed capture groups; the parameter names
  // are stored separately so they can be zipped with match results.
  const paramNames = [];

  const regexString = path
    .replace(/\//g, '\\/')
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^\\/]+)';
    });

  const regex = new RegExp(`^${regexString}$`);

  routes.push({ pattern: path, regex, paramNames, handler, allowedRoles });

  console.debug(
    `[router] addRoute: registered route '${path}' — roles: [${allowedRoles.join(', ') || 'public'}]`
  );
};

// ---------------------------------------------------------------------------
// Route Guard (internal — not exported)
// ---------------------------------------------------------------------------

/**
 * Determines whether the current user is permitted to access a route, and
 * returns either 'allow' or a redirect instruction.
 *
 * Guard logic:
 *   - If allowedRoles is empty, the route is public — always allow.
 *   - If currentRole is null (unauthenticated), redirect to /login.
 *   - If currentRole is in allowedRoles, allow.
 *   - Otherwise redirect to the default route for the user's role.
 *
 * @param {string[]}     allowedRoles - Roles permitted to access the route.
 *   An empty array means the route is public.
 * @param {string|null}  currentRole  - The authenticated user's role, or null.
 * @returns {string} 'allow', or a redirect string such as 'redirect:/login',
 *   'redirect:/dashboard', 'redirect:/admin', 'redirect:/owner'.
 *
 * @example
 *   guardRoute(['student'], 'student')        // → 'allow'
 *   guardRoute(['student'], null)             // → 'redirect:/login'
 *   guardRoute(['administrator'], 'student')  // → 'redirect:/dashboard'
 *   guardRoute([], null)                      // → 'allow'  (public route)
 */
const guardRoute = (allowedRoles, currentRole) => {
  // Public route — no authentication required
  if (allowedRoles.length === 0) {
    return 'allow';
  }

  // Unauthenticated — send to login regardless of requested route
  if (currentRole === null) {
    return 'redirect:/login';
  }

  // Role is in the permitted list — allow through
  if (allowedRoles.includes(currentRole)) {
    return 'allow';
  }

  // Authenticated but wrong role — redirect to this role's default route.
  // Fall back to /login if the role is somehow not in the default map,
  // which would indicate a data integrity problem worth logging.
  const defaultRoute = ROLE_DEFAULT_ROUTES[currentRole];
  if (!defaultRoute) {
    console.error(
      `[router] guardRoute: unrecognised role '${currentRole}' has no default route — redirecting to /login.`
    );
    return 'redirect:/login';
  }

  return `redirect:${defaultRoute}`;
};

// ---------------------------------------------------------------------------
// Route Resolution
// ---------------------------------------------------------------------------

/**
 * Parses the current URL hash fragment and returns the path component,
 * stripping the leading '#'.
 *
 * @returns {string} The current route path (e.g. '/dashboard', '/login').
 *   Returns '/login' if no hash is present.
 */
const getCurrentPath = () => {
  const hash = window.location.hash;

  if (!hash || hash === '#') {
    return '/login';
  }

  // Strip leading '#' — path begins with '/'
  return hash.slice(1) || '/login';
};

/**
 * Attempts to match the given path against all registered routes.
 * Returns the first match found, with extracted parameters.
 *
 * @param {string} path - The route path to match (e.g. '/dashboard').
 * @returns {{ route: Object, params: Object }|null}
 *   The matched route entry (including allowedRoles) and extracted params,
 *   or null if no match found.
 */
const matchRoute = (path) => {
  for (const route of routes) {
    const match = path.match(route.regex);

    if (match) {
      // Build params object by zipping paramNames with capture group values
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });

      return { route, params };
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/**
 * Navigates to the given route path by updating the URL hash.
 * Triggers the hashchange event, which the router listens to.
 *
 * @param {string} path - The route path to navigate to (e.g. '/dashboard').
 * @returns {void}
 *
 * @example
 *   navigate('/dashboard');
 *   navigate('/admin/abc123');
 */
const navigate = (path) => {
  window.location.hash = path;
};

// ---------------------------------------------------------------------------
// Router Dispatch
// ---------------------------------------------------------------------------

/**
 * Resolves the current URL hash to a registered route, applies the role
 * guard, and either calls the handler or redirects as instructed.
 *
 * This function is async because getCurrentUserRole() performs a Firebase
 * token refresh and optional Firestore read. The hashchange and load event
 * listeners call it without awaiting — unhandled rejection is caught
 * internally and logged.
 *
 * Guard outcomes:
 *   - 'allow'           → call the matched handler
 *   - 'redirect:/path'  → call navigate() to the redirect target
 *
 * If no matching route is found for the requested path, the router falls
 * back to /login. If /login is also not registered, an error is logged.
 *
 * @returns {Promise<void>}
 */
const dispatch = async () => {
  const path = getCurrentPath();
  console.debug(`[router] dispatch: resolving path '${path}'`);

  try {
    const matched = matchRoute(path);

    if (!matched) {
      // No registered route matches the requested path — fall back to /login
      console.warn(`[router] dispatch: no route matched for '${path}' — redirecting to /login`);
      const loginMatch = matchRoute('/login');
      if (loginMatch) {
        // /login is public — no guard check needed for the fallback itself
        loginMatch.route.handler({});
      } else {
        console.error(
          '[router] dispatch: /login route is not registered. Call addRoute before initRouter.'
        );
      }
      return;
    }

    // Retrieve the current user's role for the guard check.
    // Returns null if no user is signed in.
    const currentRole = await getCurrentUserRole();

    const guardResult = guardRoute(matched.route.allowedRoles, currentRole);

    if (guardResult === 'allow') {
      console.debug(
        `[router] dispatch: access granted to '${path}' for role '${currentRole ?? 'public'}'`
      );
      matched.route.handler(matched.params);
      return;
    }

    // Guard returned a redirect instruction — extract the target path
    // Format is 'redirect:/path'
    const redirectTarget = guardResult.slice('redirect:'.length);
    console.info(
      `[router] dispatch: guard redirected '${path}' → '${redirectTarget}' ` +
        `(role: '${currentRole ?? 'unauthenticated'}')`
    );
    navigate(redirectTarget);
  } catch (error) {
    // Catch-all: an unexpected error in dispatch must not silently swallow
    // navigation. Log and attempt to fall back to /login.
    console.error('[router] dispatch: unexpected error during dispatch.', error);
    const loginMatch = matchRoute('/login');
    if (loginMatch) {
      loginMatch.route.handler({});
    }
  }
};

// ---------------------------------------------------------------------------
// Router Initialisation
// ---------------------------------------------------------------------------

/**
 * Initialises the router by attaching the hashchange event listener and
 * dispatching the current route immediately.
 *
 * Must be called after all routes have been registered with addRoute().
 *
 * @returns {void}
 *
 * @example
 *   addRoute('/login',     renderLoginForm,  []);
 *   addRoute('/dashboard', renderDashboard,  ['student']);
 *   initRouter();
 */
const initRouter = () => {
  window.addEventListener('hashchange', dispatch);
  window.addEventListener('load', dispatch);

  console.info('[router] initRouter: router initialised.');
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { addRoute, navigate, initRouter };
