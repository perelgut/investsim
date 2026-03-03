/**
 * @file vitest.config.js
 * @description Vitest configuration for InvestSim unit and integration tests.
 *              All tests run against the Firebase Local Emulator Suite.
 *
 * @author Stephen Perelgut and Claude.ai
 * @date March 2026
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
  },
});
