import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const GamePage = lazy(() => import('./pages/GamePage').then((module) => ({ default: module.GamePage })));

const CardDemoPage = lazy(() => import('./pages/CardDemoPage').then((module) => ({ default: module.CardDemoPage })));

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading home...</div>}>
            <HomePage />
          </Suspense>
        }
      />
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
            <GamePage />
          </Suspense>
        }
      />
      <Route
        path="/game/:gameId"
        element={
          <Suspense fallback={<div className="p-6 text-slate-200">Loading game...</div>}>
            <GamePage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
