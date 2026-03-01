/**
 * @file auth-view.js
 * @description Renders the login and registration forms for the InvestSim
 *              application. Handles client-side validation, calls auth-service
 *              for all Firebase operations, and displays inline error messages
 *              in plain language.
 *
 * @module auth-view
 * @author Development Team
 * @date March 2026
 * @dependencies auth-service.js, validators.js (stub until Task 5.9), router.js
 */

'use strict';

import { registerUser } from '../services/auth-service.js';
// import { navigate } from '../router.js';
// The following is a temporary workaround until the router is implemented in Task 2.1:
const navigate = (path) => {
  window.location.hash = path;
};

// ---------------------------------------------------------------------------
// Validators stub
// ---------------------------------------------------------------------------
// Full implementation arrives in Task 5.9. These stubs allow the form to
// function during development without blocking progress on Phase 1.

/**
 * Stub validator — replaced by validators.js in Task 5.9.
 * @param {string} value - Value to check.
 * @param {string} fieldName - Human-readable field name for error messages.
 * @returns {{ valid: boolean, message: string }}
 */
const stubRequired = (value, fieldName) => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: '' };
};

// ---------------------------------------------------------------------------
// Registration Form
// ---------------------------------------------------------------------------

/**
 * Creates and returns the student self-registration form as a DOM element.
 *
 * Wires the submit handler to call registerUser from auth-service.js after
 * client-side validation. Displays inline error messages on validation or
 * Firebase failure. On successful registration, navigates to /dashboard.
 *
 * @returns {HTMLElement} The assembled registration form container element.
 *
 * @example
 *   const view = renderRegistrationForm();
 *   document.getElementById('app').replaceChildren(view);
 */
const renderRegistrationForm = () => {
  const container = document.createElement('div');
  container.className = 'auth-container';
  container.id = 'registration-form-container';

  container.innerHTML = `
    <div class="auth-card">
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Start with <strong>$10,000</strong> in simulated capital.</p>

      <div class="form-field">
        <label for="reg-display-name">Display Name</label>
        <input
          type="text"
          id="reg-display-name"
          name="displayName"
          autocomplete="name"
          maxlength="50"
          placeholder="Your full name"
          title="Enter the name that will appear on your portfolio"
        />
        <span class="field-error" id="reg-display-name-error" aria-live="polite"></span>
      </div>

      <div class="form-field">
        <label for="reg-email">Email Address</label>
        <input
          type="email"
          id="reg-email"
          name="email"
          autocomplete="email"
          placeholder="you@example.com"
          title="Enter your email address — this will be your login"
        />
        <span class="field-error" id="reg-email-error" aria-live="polite"></span>
      </div>

      <div class="form-field">
        <label for="reg-password">Password</label>
        <input
          type="password"
          id="reg-password"
          name="password"
          autocomplete="new-password"
          placeholder="Minimum 8 characters"
          title="Choose a password with at least 8 characters"
        />
        <span class="field-error" id="reg-password-error" aria-live="polite"></span>
      </div>

      <div class="form-field">
        <label for="reg-confirm-password">Confirm Password</label>
        <input
          type="password"
          id="reg-confirm-password"
          name="confirmPassword"
          autocomplete="new-password"
          placeholder="Re-enter your password"
          title="Re-enter your password to confirm it"
        />
        <span class="field-error" id="reg-confirm-password-error" aria-live="polite"></span>
      </div>

      <span class="field-error form-error" id="reg-form-error" aria-live="polite"></span>

      <button
        type="button"
        id="reg-submit-btn"
        class="btn btn-primary"
        title="Create your InvestSim account"
      >
        Create Account
      </button>

      <p class="auth-switch">
        Already have an account?
        <a href="/#/login" title="Go to the login page">Sign in</a>
      </p>
    </div>
  `;

  // Wire the submit button
  container
    .querySelector('#reg-submit-btn')
    .addEventListener('click', () => handleRegistrationSubmit(container));

  return container;
};

// ---------------------------------------------------------------------------
// Registration Submit Handler
// ---------------------------------------------------------------------------

/**
 * Handles the registration form submission. Runs client-side validation,
 * calls registerUser, and either shows inline errors or navigates to the
 * dashboard on success.
 *
 * @param {HTMLElement} container - The registration form container element,
 *   used to locate field inputs and error spans.
 * @returns {Promise<void>}
 */
const handleRegistrationSubmit = async (container) => {
  // Clear all previous error messages
  container.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });

  const displayName = container.querySelector('#reg-display-name').value.trim();
  const email = container.querySelector('#reg-email').value.trim();
  const password = container.querySelector('#reg-password').value;
  const confirmPassword = container.querySelector('#reg-confirm-password').value;
  const submitBtn = container.querySelector('#reg-submit-btn');

  // Client-side validation
  // TODO: Replace stubs with validators.js functions in Task 5.9
  let hasError = false;

  const nameCheck = stubRequired(displayName, 'Display name');
  if (!nameCheck.valid) {
    container.querySelector('#reg-display-name-error').textContent = nameCheck.message;
    hasError = true;
  }

  const emailCheck = stubRequired(email, 'Email address');
  if (!emailCheck.valid) {
    container.querySelector('#reg-email-error').textContent = emailCheck.message;
    hasError = true;
  }

  const passwordCheck = stubRequired(password, 'Password');
  if (!passwordCheck.valid) {
    container.querySelector('#reg-password-error').textContent = passwordCheck.message;
    hasError = true;
  }

  if (password && password.length < 8) {
    container.querySelector('#reg-password-error').textContent =
      'Password must be at least 8 characters long.';
    hasError = true;
  }

  if (password !== confirmPassword) {
    container.querySelector('#reg-confirm-password-error').textContent = 'Passwords do not match.';
    hasError = true;
  }

  if (hasError) return;

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account…';

  // Call auth-service
  const { user, error } = await registerUser(email, password, displayName);

  if (error) {
    container.querySelector('#reg-form-error').textContent = error;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
    return;
  }

  // Success — navigate to dashboard
  navigate('/dashboard');
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { renderRegistrationForm };
