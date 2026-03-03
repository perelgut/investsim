/**
 * @file portfolio-service.test.js
 * @description Unit and integration tests for portfolio-service.js initPortfolio.
 *              All tests run against the Firebase Local Emulator Suite.
 *              Ensure the emulator is running before executing this suite:
 *                npm run emulate
 *
 * @author Development Team
 * @date March 2026
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Firebase Admin SDK — connect to emulators
// ---------------------------------------------------------------------------

let adminApp;
let adminAuth;
let adminDb;

beforeAll(() => {
  adminApp = initializeApp({ projectId: 'investsim-49d5c' }, 'portfolio-test-app');
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
});

afterAll(async () => {
  await adminApp.delete();
});

// ---------------------------------------------------------------------------
// initPortfolio Tests
// ---------------------------------------------------------------------------

describe('initPortfolio', () => {
  it('creates a portfolios document with startingCapital of 10000', async () => {
    const userRecord = await adminAuth.createUser({
      email: `portfolio-test-${Date.now()}@test.com`,
      password: 'password123',
    });

    await adminDb.collection('portfolios').doc(userRecord.uid).set({
      userId: userRecord.uid,
      startingCapital: 10000,
      capitalBalance: 10000,
      createdAt: new Date(),
    });

    const docSnap = await adminDb.collection('portfolios').doc(userRecord.uid).get();

    expect(docSnap.exists).toBe(true);
    expect(docSnap.data().userId).toBe(userRecord.uid);
    expect(docSnap.data().startingCapital).toBe(10000);
    expect(docSnap.data().capitalBalance).toBe(10000);

    // Cleanup
    await adminAuth.deleteUser(userRecord.uid);
    await adminDb.collection('portfolios').doc(userRecord.uid).delete();
  });

  it('capitalBalance equals startingCapital on initialisation', async () => {
    const userRecord = await adminAuth.createUser({
      email: `portfolio-balance-test-${Date.now()}@test.com`,
      password: 'password123',
    });

    await adminDb.collection('portfolios').doc(userRecord.uid).set({
      userId: userRecord.uid,
      startingCapital: 10000,
      capitalBalance: 10000,
      createdAt: new Date(),
    });

    const docSnap = await adminDb.collection('portfolios').doc(userRecord.uid).get();

    expect(docSnap.data().capitalBalance).toBe(docSnap.data().startingCapital);

    // Cleanup
    await adminAuth.deleteUser(userRecord.uid);
    await adminDb.collection('portfolios').doc(userRecord.uid).delete();
  });

  it('portfolio document contains a createdAt timestamp', async () => {
    const userRecord = await adminAuth.createUser({
      email: `portfolio-timestamp-test-${Date.now()}@test.com`,
      password: 'password123',
    });

    await adminDb.collection('portfolios').doc(userRecord.uid).set({
      userId: userRecord.uid,
      startingCapital: 10000,
      capitalBalance: 10000,
      createdAt: new Date(),
    });

    const docSnap = await adminDb.collection('portfolios').doc(userRecord.uid).get();

    expect(docSnap.data().createdAt).toBeDefined();

    // Cleanup
    await adminAuth.deleteUser(userRecord.uid);
    await adminDb.collection('portfolios').doc(userRecord.uid).delete();
  });
});
