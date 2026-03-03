/**
 * @file router.js
 * @description Client-side hash router for InvestSim. Listens for hashchange
 *              events and dispatches to registered route handlers based on the
 *              current URL hash fragment.
 *
 *              Routes are registered with addRoute(path, handler) where path
 *              may contain named parameters prefixed with ':' (e.g. '/student/:uid').
 *              Named parameters are extracted and passed to the handler as an
 *              object.
 *
 *              The router does not enforce authentication or role-based access
 *              control directly — route guards are applied in Task 2.2 by
 *              wrapping handlers with requireAuth() and requireRole().
 *
 * @module router
 * @author Stephen Perelgut and Claude.ai
 * @date March 2026
 */

'use strict';

// ---------------------------------------------------------------------------
// Route Registry
// ---------------------------------------------------------------------------

/**
 * Internal registry of all registered routes.
 * Each entry stores the original path pattern, a compiled RegExp for matching,
 * an array of parameter names extracted from the pattern, and the handler.
 *
 * @type {Array<{
 *   pattern:    string,
 *   regex:      RegExp,
 *   paramNames: string[],
 *   handler:    function(Object): void
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
 * @param {string}   path    - Route path pattern (e.g. '/dashboard', '/student/:uid').
 * @param {function(params: Object): void} handler - Function called when the
 *   route is matched. Receives an object of extracted named parameters.
 * @returns {void}
 *
 * @example
 *   addRoute('/dashboard', () => renderDashboard());
 *   addRoute('/student/:uid', ({ uid }) => renderStudentDetail(uid));
 */
const addRoute = (path, handler) => {
  // Convert path pattern to a RegExp
  // ':paramName' segments become named capture groups
  const paramNames = [];

  const regexString = path
    .replace(/\//g, '\\/')
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^\\/]+)';
    });

  const regex = new RegExp(`^${regexString}$`);

  routes.push({ pattern: path, regex, paramNames, handler });

  console.debug(`[router] addRoute: registered route '${path}'`);
};

// ---------------------------------------------------------------------------
// Route Resolution
// ---------------------------------------------------------------------------

/**
 * Parses the current URL hash fragment and returns the path component,
 * stripping the leading '#/' or '#'.
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
 * @returns {{ handler: function, params: Object }|null}
 *   The matched handler and extracted params, or null if no match found.
 */
const matchRoute = (path) => {
  for (const route of routes) {
    const match = path.match(route.regex);

    if (match) {
      // Build params object from named capture groups
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });

      return { handler: route.handler, params };
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/**
 * Navigates to the given route path by updating the URL hash.
 * Triggers the hashchange event which the router listens to.
 *
 * @param {string} path - The route path to navigate to (e.g. '/dashboard').
 * @returns {void}
 *
 * @example
 *   navigate('/dashboard');
 *   navigate('/student/abc123');
 */
const navigate = (path) => {
  window.location.hash = path;
};

// ---------------------------------------------------------------------------
// Router Dispatch
// ---------------------------------------------------------------------------

/**
 * Resolves the current URL hash to a registered route and calls its handler.
 * If no matching route is found, falls back to the '/login' route.
 * If '/login' is also not registered, logs an error.
 *
 * @returns {void}
 */
const dispatch = () => {
  const path = getCurrentPath();
  console.debug(`[router] dispatch: resolving path '${path}'`);

  const matched = matchRoute(path);

  if (matched) {
    console.debug(`[router] dispatch: matched route '${path}'`);
    matched.handler(matched.params);
    return;
  }

  // No match found — fall back to login
  console.warn(`[router] dispatch: no route matched for '${path}' — redirecting to /login`);

  const loginMatch = matchRoute('/login');
  if (loginMatch) {
    loginMatch.handler({});
  } else {
    console.error('[router] dispatch: /login route is not registered. Call addRoute before init.');
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
 *   addRoute('/login',     () => renderLoginForm());
 *   addRoute('/dashboard', () => renderDashboard());
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
