/**
 * @file portfolio-service.js
 * @description Manages all portfolio data operations for InvestSim: initialisation,
 *              buy, sell, portfolio reads, and transaction history. This module is
 *              the authoritative source for all portfolio state changes.
 *
 *              All Firestore writes that affect capitalBalance use batch writes
 *              to ensure atomicity — a transaction and its balance change either
 *              both succeed or both fail.
 *
 * @module portfolio-service
 * @author Development Team
 * @date March 2026
 * @dependencies firebase-config.js, constants.js, market-data-service.js (Phase 3)
 */

'use strict';

import { db } from '../firebase-config.js';
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { STARTING_CAPITAL } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Portfolio Initialisation
// ---------------------------------------------------------------------------

/**
 * Creates the initial portfolio document for a newly registered student.
 * Called automatically by registerUser in auth-service.js immediately after
 * successful account creation.
 *
 * Document path: portfolios/{userId}
 *
 * Fields written:
 *   - userId          {string}    Firebase Auth UID
 *   - startingCapital {number}    Fixed starting capital — STARTING_CAPITAL constant
 *   - capitalBalance  {number}    Current available cash — starts equal to startingCapital
 *   - createdAt       {Timestamp} Server-side Firestore timestamp
 *
 * @param {string} userId - The Firebase Auth UID of the newly registered student.
 * @returns {Promise<{success: boolean, error: string|null}>}
 *   Resolves with { success: true, error: null } on success, or
 *   { success: false, error } if the Firestore write fails.
 *
 * @example
 *   const { success, error } = await initPortfolio(user.uid);
 *   if (!success) {
 *     console.error('Portfolio initialisation failed:', error);
 *   }
 */
const initPortfolio = async (userId) => {
  try {
    await setDoc(doc(db, 'portfolios', userId), {
      userId,
      startingCapital: STARTING_CAPITAL,
      capitalBalance: STARTING_CAPITAL,
      createdAt: serverTimestamp(),
    });

    console.info(
      `[portfolio-service] initPortfolio: portfolio created for user ${userId} with $${STARTING_CAPITAL} CAD.`
    );
    return { success: true, error: null };
  } catch (error) {
    console.error('[portfolio-service] initPortfolio failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { initPortfolio };
