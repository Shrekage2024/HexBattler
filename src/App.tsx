import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const LobbyPage = lazy(() => import('./pages/LobbyPage').then((module) => ({ default: module.LobbyPage })));
const CreateGamePage = lazy(() => import('./pages/CreateGamePage').then((module) => ({ default: module.CreateGamePage })));
const JoinGamePage = lazy(() => import('./pages/JoinGamePage').then((module) => ({ default: module.JoinGamePage })));
const CharacterSelectPage = lazy(() =>
  import('./pages/CharacterSelectPage').then((module) => ({ default: module.CharacterSelectPage }))
);
const GameTablePage = lazy(() => import('./pages/GameTablePage').then((module) => ({ default: module.GameTablePage })));
const CardDemoPage = lazy(() => import('./pages/CardDemoPage').then((module) => ({ default: module.CardDemoPage })));

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading...</div>}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path="/create"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading...</div>}>
            <CreateGamePage />
          </Suspense>
        }
      />
      <Route
        path="/join"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading...</div>}>
            <JoinGamePage />
          </Suspense>
        }
      />
      <Route
        path="/lobby/:gameId"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading...</div>}>
            <LobbyPage />
          </Suspense>
        }
      />
      <Route
        path="/character-select/:gameId"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading...</div>}>
            <CharacterSelectPage />
          </Suspense>
        }
      />
      <Route path="/lobby" element={<Navigate to="/" replace />} />
      <Route
        path="/cards"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading card demo...</div>}>
            <CardDemoPage />
          </Suspense>
        }
      />
      <Route
        path="/table"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading game...</div>}>
            <GameTablePage />
          </Suspense>
        }
      />
      <Route
        path="/game/:gameId"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading game...</div>}>
            <GameTablePage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
