/**
 * @file constants.js
 * @description Application-wide constants for InvestSim. All magic numbers
 *              and configuration values are defined here. No other module
 *              should hardcode these values.
 *
 * @module constants
 * @author Development Team
 * @date March 2026
 */

'use strict';

/**
 * Starting capital allocated to every new student portfolio, in CAD.
 * To change the starting capital for future cohorts, update this value only.
 *
 * @constant {number}
 */
const STARTING_CAPITAL = 10000;

/**
 * Cache TTL for FMP price data, in milliseconds.
 *
 * Development (Basic FMP tier):  86400000 = 24 hours
 * Classroom (Premium FMP tier):  1200000  = 20 minutes
 *
 * To upgrade from development to classroom deployment, change this value
 * to 1200000 and update the FMP_API_KEY GitHub Actions Secret to the
 * Premium key.
 *
 * @constant {number}
 */
const CACHE_TTL_MS = 86400000;

/**
 * Base URL for the Financial Modeling Prep API.
 *
 * @constant {string}
 */
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Simplified fixed-yield bond instruments available for student investment.
 * These are educational approximations of Government of Canada instruments —
 * they are NOT real market instruments and do not reflect live rates.
 *
 * Each bond defines:
 *   id          {string}  Unique identifier used as assetId in transactions
 *   name        {string}  Display name shown to students
 *   termMonths  {number}  Term length in months
 *   couponRate  {number}  Annual interest rate as a decimal (e.g. 0.048 = 4.8%)
 *   parValue    {number}  Face value per unit in CAD
 *
 * Stub — populated fully in Task 3.5.
 *
 * @constant {Array<{id: string, name: string, termMonths: number, couponRate: number, parValue: number}>}
 */
const BOND_INSTRUMENTS = [];

export { STARTING_CAPITAL, CACHE_TTL_MS, FMP_BASE_URL, BOND_INSTRUMENTS };
