# HexStrike

HexStrike is a playable prototype for a 2–4 player online hex board game built with React, TypeScript, Vite, Tailwind CSS, and Firebase. The initial phase includes a multiplayer lobby with invite links, anonymous auth, a placeholder hex board, and Firestore-backed save/resume.

## Scripts
- `npm run dev` – start the Vite dev server
- `npm run build` – typecheck and build for production
- `npm run preview` – preview the production build locally

## Environment
Create a `.env.local` file with your Firebase config values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Project structure
- `src/pages` – top-level routes (Home, Game lobby/board)
- `src/components` – reusable UI such as the hex board renderer
- `src/hooks` – shared hooks including anonymous auth
- `src/lib` – Firebase initialization and Firestore helpers
- `src/types` – game data models
