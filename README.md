# InvestSim

A TSX stock market simulation web application for finance and business students.
Students explore investment strategies across TSX-listed equities, ETFs, crypto
assets, and simplified fixed-yield bond instruments — using simulated capital in
a safe, consequence-free environment.

Built with vanilla JavaScript (ES2022), Firebase Authentication, Cloud Firestore,
and the Financial Modeling Prep API. Deployed as a static site on GitHub Pages.

---

## Live Application

> **URL:** `https://perelgut.github.io/investsim`
> _(Placeholder — update after first deployment in Task 7.6)_

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Firebase Project Setup](#firebase-project-setup)
5. [Firebase Emulator Suite](#firebase-emulator-suite)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [Repository Structure](#repository-structure)
9. [Architecture Diagrams](#architecture-diagrams)
10. [Owner Account Setup](#owner-account-setup)
11. [FMP API Tiers](#fmp-api-tiers)
12. [Future Releases](#future-releases)

---

## Prerequisites

Ensure the following are installed and configured before cloning the repository.

| Requirement                                          | Version      | Notes                                          |
| ---------------------------------------------------- | ------------ | ---------------------------------------------- |
| [Node.js](https://nodejs.org/)                       | v18 or above | `node --version` to verify                     |
| [Git](https://git-scm.com/)                          | Any current  | `git --version` to verify                      |
| [Firebase CLI](https://firebase.google.com/docs/cli) | Latest       | `npm install -g firebase-tools`                |
| Java Runtime                                         | v11 or above | Required by the Firebase Emulator Suite        |
| VS Code                                              | Any current  | Recommended IDE — workspace config is included |

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/perelgut/investsim.git
cd investsim

# 2. Install dependencies
npm install

# 3. Copy the environment variable template and fill in real values
cp .env.example .env
# Edit .env — see Environment Variables section below

# 4. Log in to Firebase CLI
firebase login

# 5. Start the Firebase emulator suite
npm run emulate

# 6. Open index.html in your browser (Live Server or any static file server)
```

---

## Environment Variables

All required environment variables are documented in `.env.example`.
Copy that file to `.env` and populate it with real values.

```bash
cp .env.example .env
```

**`.env` must never be committed to the repository.** It is listed in `.gitignore`.

| Variable                       | Purpose                                    | Where Set                            |
| ------------------------------ | ------------------------------------------ | ------------------------------------ |
| `FIREBASE_API_KEY`             | Firebase project API key                   | Local `.env` + GitHub Actions Secret |
| `FIREBASE_AUTH_DOMAIN`         | Firebase Auth domain                       | Local `.env` + GitHub Actions Secret |
| `FIREBASE_PROJECT_ID`          | Firebase project identifier                | Local `.env` + GitHub Actions Secret |
| `FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                    | Local `.env` + GitHub Actions Secret |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID               | Local `.env` + GitHub Actions Secret |
| `FIREBASE_APP_ID`              | Firebase app ID                            | Local `.env` + GitHub Actions Secret |
| `FMP_API_KEY`                  | Financial Modeling Prep API key            | Local `.env` + GitHub Actions Secret |
| `OWNER_EMAIL`                  | Owner account email — setup script only    | Local `.env` **only** — never in CI  |
| `OWNER_PASSWORD`               | Owner account password — setup script only | Local `.env` **only** — never in CI  |

> **`OWNER_EMAIL` and `OWNER_PASSWORD`** are used exclusively by
> `scripts/setup-owner.js`. They must never be added to GitHub Actions Secrets
> and are never injected into the deployed application.

---

## Firebase Project Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and
   create a new project named `investsim` (or your agreed name) on the **Spark
   (free) tier**.

2. Enable **Authentication** → Sign-in method → **Email/Password**.

3. Create a **Cloud Firestore** database in **production mode**.
   _(Security Rules are deployed separately — see below.)_

4. Register a **Web App** inside the project to obtain the Firebase config object.
   Copy the six config values into your local `.env` file.

5. Download a **Service Account key** (Project Settings → Service Accounts →
   Generate new private key). Save it locally — **never commit this file**.
   Set the path in your shell:

```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

6. Deploy Firestore Security Rules:

```bash
   firebase deploy --only firestore:rules
```

---

## Firebase Emulator Suite

All development and testing should run against the local emulator rather than
the live Firebase project.

**Start the emulator:**

```bash
npm run emulate
# equivalent to: firebase emulators:start
```

Emulator endpoints:

| Service         | Default Port     | UI                                      |
| --------------- | ---------------- | --------------------------------------- |
| Firebase Auth   | `localhost:9099` | [localhost:4000](http://localhost:4000) |
| Cloud Firestore | `localhost:8080` | [localhost:4000](http://localhost:4000) |

The application detects emulator mode automatically via the
`FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` environment
variables.

**Run the owner setup script against the emulator (recommended first):**

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 \
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
node scripts/setup-owner.js
```

---

## Running Locally

```bash
# Start the Firebase emulator
npm run emulate

# Serve index.html with VS Code Live Server, or any static file server:
npx serve .
# Then open http://localhost:3000 in your browser
```

Run the unit test suite:

```bash
npm test
```

> Tests connect to the Firebase emulator automatically. Ensure the emulator is
> running before executing `npm test`.

---

## Deployment

The application deploys automatically to GitHub Pages via GitHub Actions whenever
code is merged to the `main` branch.

**Branch strategy:**

| Branch      | Purpose                                         |
| ----------- | ----------------------------------------------- |
| `main`      | Production — triggers deployment on every push  |
| `develop`   | Integration — merge feature branches here first |
| `feature/*` | Individual feature development                  |

**To deploy:**

```bash
# 1. Merge develop into main via a pull request on GitHub
# 2. GitHub Actions triggers automatically — monitor at:
#    https://github.com/perelgut/investsim/actions

# To deploy Firestore Security Rules separately:
firebase deploy --only firestore:rules
```

**GitHub Actions Secrets required** (Settings → Secrets and variables → Actions):

All six `FIREBASE_*` variables plus `FMP_API_KEY` must be stored as repository
secrets. `OWNER_EMAIL` and `OWNER_PASSWORD` must **not** be added here.

---

## Repository Structure

```
investsim/
│
├── index.html                  # Application entry point
├── README.md                   # This file
├── .env.example                # Environment variable documentation
├── .gitignore                  # Excludes .env, node_modules, build artefacts
├── package.json                # Dependencies and npm scripts
├── firestore.rules             # Firestore Security Rules
│
├── css/
│   ├── main.css                # Global styles and CSS custom properties
│   ├── dashboard.css           # Student dashboard styles
│   ├── auth.css                # Login and registration styles
│   └── admin.css               # Administrator view styles
│
├── js/
│   ├── app.js                  # Application entry point — Firebase init, routing
│   ├── router.js               # Client-side hash router with role guards
│   │
│   ├── services/
│   │   ├── auth-service.js     # Firebase Authentication operations and role claims
│   │   ├── market-data-service.js  # FMP API client, instrument search, bond calculator
│   │   ├── portfolio-service.js    # Buy, sell, portfolio read, transaction history
│   │   └── cache-service.js    # Firestore price cache — TTL management
│   │
│   ├── views/
│   │   ├── dashboard-view.js   # Student portfolio dashboard
│   │   ├── trade-view.js       # Buy / sell instrument screen
│   │   ├── admin-view.js       # Administrator student list and detail
│   │   ├── owner-view.js       # Owner user management and role assignment
│   │   └── auth-view.js        # Login and self-registration forms
│   │
│   ├── components/
│   │   ├── portfolio-table.js  # Reusable positions table component
│   │   ├── position-card.js    # Single position detail with transaction history
│   │   ├── trade-modal.js      # Buy / sell confirmation modal
│   │   └── nav-bar.js          # Role-aware navigation bar
│   │
│   └── utils/
│       ├── formatters.js       # Currency, percentage, date, gain/loss formatters
│       ├── validators.js       # Form input validation functions
│       └── constants.js        # STARTING_CAPITAL, CACHE_TTL_MS, BOND_INSTRUMENTS
│
├── scripts/
│   └── setup-owner.js          # ONE-TIME script — creates Owner account in Firebase
│
├── tests/
│   ├── auth-service.test.js
│   ├── router.test.js
│   ├── cache-service.test.js
│   ├── market-data-service.test.js
│   ├── portfolio-service.test.js
│   └── firestore-rules.test.js
│
├── docs/
│   └── diagrams/               # Mermaid architecture and data flow diagrams
│       ├── DFD-01-system-overview.mermaid
│       ├── DFD-02-market-data-cache.mermaid
│       ├── DFD-03-portfolio-transaction.mermaid
│       ├── CFD-01-startup-routing.mermaid
│       ├── CFD-02-authentication.mermaid
│       └── CFD-03-trade-screen.mermaid
│
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions — deploy to GitHub Pages on push to main
```

---

## Architecture Diagrams

All architecture, data flow, and control flow diagrams are maintained as Mermaid
source files in [`/docs/diagrams/`](./docs/diagrams/).

| Diagram                        | Type         | Description                                                     |
| ------------------------------ | ------------ | --------------------------------------------------------------- |
| `DFD-01-system-overview`       | Data Flow    | Complete system boundary — all layers and external entities     |
| `DFD-02-market-data-cache`     | Data Flow    | Cache hit/miss/stale logic and FMP fetch-write-back cycle       |
| `DFD-03-portfolio-transaction` | Data Flow    | Buy and sell flows through validation and Firestore batch write |
| `CFD-01-startup-routing`       | Control Flow | Page load → Firebase init → auth resolution → route dispatch    |
| `CFD-02-authentication`        | Control Flow | Register, login, and logout flows with all error branches       |
| `CFD-03-trade-screen`          | Control Flow | Instrument search, quote fetch, buy/sell with confirmation      |

Diagrams render natively in the GitHub file viewer and in VS Code with the
**Markdown Preview Mermaid Support** extension.

---

## Owner Account Setup

The Owner account is provisioned once by the developer before classroom
deployment. It is **not** created through the application UI.

```bash
# Against the emulator first (recommended):
FIRESTORE_EMULATOR_HOST=localhost:8080 \
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
node scripts/setup-owner.js

# Against the live Firebase project:
node scripts/setup-owner.js
```

> **Run this script exactly once per Firebase project.**
> See `scripts/setup-owner.js` for full documentation.

---

## FMP API Tiers

The application uses the [Financial Modeling Prep API](https://financialmodelingprep.com)
for TSX market data. Two configurations are supported:

| Tier              | Use Case             | Cache TTL  | `CACHE_TTL_MS` value |
| ----------------- | -------------------- | ---------- | -------------------- |
| Basic (free)      | Local development    | 24 hours   | `86400000`           |
| Premium (~$59/mo) | Classroom deployment | 20 minutes | `1200000`            |

To upgrade from Basic to Premium:

1. Obtain a Premium API key from financialmodelingprep.com
2. Update `CACHE_TTL_MS` in `js/utils/constants.js` to `1200000`
3. Update the `FMP_API_KEY` GitHub Actions Secret to the Premium key
4. Merge the `constants.js` change to `main` to trigger redeployment

> Enable domain restriction on your FMP key to limit usage to the GitHub Pages
> domain. The key is visible in browser network traffic — this is a known
> limitation of client-side API calls at this tier.

---

## Future Releases

| ID    | Feature                                     | Target |
| ----- | ------------------------------------------- | ------ |
| OS-01 | Historical period replay                    | v2.0   |
| OS-02 | Configurable starting capital               | v2.0   |
| OS-03 | Exportable performance reports (PDF/CSV)    | v2.0   |
| OS-04 | Leaderboard / peer comparison               | v2.0   |
| OS-05 | System-generated investment recommendations | v3.0   |
| OS-06 | LMS / grade export integration              | Future |
| OS-07 | Multilingual support (French Canada first)  | Future |
| OS-08 | Framework migration (React or Vue)          | Future |

---

_InvestSim v1.0 — Development start: March 1, 2026 — Target completion: ~May 5, 2026_
