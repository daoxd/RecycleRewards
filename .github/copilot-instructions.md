# Copilot instructions for RecycleRewards

## Project overview

This repository contains a small full-stack demo app for a school recycling rewards system:

- `RecycleRewards_FE/` is a Vite + React frontend for student/admin flows.
- `RecycleRewards_BE/` is a lightweight Express API that simulates the backend and uses in-memory data instead of a database.
- The app is designed as a mock demo, not a production-ready service with real auth, persistence, or AI integration.

The main user flows are centered on a student dashboard, waste submission scanner, admin review queue, and a simple role-based login. The frontend stores the active session in `localStorage`, and the backend uses a demo role header (`x-demo-role`) to simulate access control.

## Local commands

Run everything from the repo root or from each app folder.

### Frontend (`RecycleRewards_FE`)

```bash
cd RecycleRewards_FE
npm install
npm run dev
```

Production build:

```bash
cd RecycleRewards_FE
npm run build
```

Preview the built app:

```bash
cd RecycleRewards_FE
npm run preview
```

### Backend (`RecycleRewards_BE`)

```bash
cd RecycleRewards_BE
npm install
npm run dev
```

Or:

```bash
cd RecycleRewards_BE
npm start
```

### Environment variables

Both apps provide example env files:

- `RecycleRewards_FE/.env.example` contains `VITE_API_URL=http://localhost:5000/api`
- `RecycleRewards_BE/.env.example` contains `PORT=5000`

Use those as the starting point when creating local `.env` files.

### Tests and linting

This repository does not currently define automated test or lint scripts in `package.json`.

There is no single-test command available at the moment, and there is no configured lint runner. Validation is done by running the frontend/backend locally and checking the manual flows in the browser and API.

## Architecture and data flow

### Frontend structure

The frontend is intentionally compact:

- `src/App.jsx` is the main application file and contains most page-level logic.
- `src/services/api.js` centralizes fetch calls and sets a JSON content type.
- `src/services/auth.service.js` wraps the API calls used by the UI for auth, dashboard data, submission creation, and admin review.
- The app uses URL hash routing (`location.hash`) instead of a router library; `route` state is derived from the hash.

Student and admin screens are rendered conditionally inside `App` based on the active role and route.

### Backend structure

The backend is organized around Express routes, controllers, and in-memory models:

- `server.js` boots the app and attaches `/api` routes.
- `src/routes/index.js` mounts the feature route groups.
- `src/routes/auth.routes.js`, `src/routes/waste.routes.js`, and `src/routes/admin.routes.js` define the actual endpoints.
- `src/controllers/*.js` contain request logic.
- `src/models/*.js` hold the mock data and helper functions that mutate it.
- `src/middlewares/auth.middleware.js` checks the `x-demo-role` header for role access.

### Important behavior

- The app is a mock system: submissions live in memory, not in a real database.
- Student submissions are stored in `src/models/submission.model.js` with a small `createSubmission` helper.
- Admin review updates the same in-memory list and can mark submissions as `approved` or `rejected`.
- There is no real token-based auth flow; the frontend receives a mock user object and stores it in `localStorage`.

## Key conventions specific to this repo

- Prefer working within the existing mock-data architecture rather than introducing a database or auth framework unless the task explicitly calls for it.
- Keep API contract expectations aligned with the frontend calls in `src/services/auth.service.js` and the backend routes/controllers.
- The demo app assumes a single school context (`THCS Nguyễn Du`) and uses Vietnamese labels throughout the UI.
- Status values are strings such as `pending`, `approved`, and `rejected`; do not introduce new status names without updating both UI and backend logic.
- The frontend and backend are separate packages, but they are tightly coupled by the API URL and the mock role header. Any route or payload change should be checked in both sides.
- If you need to debug auth or permissions, inspect the `x-demo-role` header flow in `src/middlewares/auth.middleware.js` and the API request helper in `src/services/api.js` before changing business logic.
- This project intentionally uses simple file-based modules rather than frameworks like Redux, Prisma, or a database layer. Keep changes consistent with that pattern.

## Safe change patterns

- Backend changes should usually be made in the route/controller/model chain for the relevant feature.
- Frontend changes should usually stay in `src/App.jsx` or the relevant service file unless a new reusable UI component is clearly needed.
- When validating changes, start the backend and frontend together and confirm the same mock data flow still works end-to-end.
