/**
 * @file setup.js
 * @description Global test setup for InvestSim Vitest suite.
 *              Sets emulator environment variables before any test runs,
 *              ensuring all Firebase SDK calls target the local emulators
 *              rather than the live Firebase project.
 *
 * @author Stephen Perelgut and Claude.ai
 * @date March 2026
 */

// Point all Firebase SDK calls at the local emulators
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Suppress Firebase emulator warnings in test output
process.env.FIREBASE_APPCHECK_DEBUG_TOKEN = 'true';
