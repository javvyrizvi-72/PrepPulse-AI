import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import InterviewReport from './pages/InterviewReport';
import Practice from './pages/Practice';
import Questions from './pages/Questions';
import Bookmarks from './pages/Bookmarks';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import { AppShell } from './components/AppShell';
import { useAuth } from './lib/auth';

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
        <p className="text-[12px] text-ink-400">Checking your session</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <AppShell>{children}</AppShell>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50 px-6 text-center dark:bg-ink-950">
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-indigo-500">404</p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-ink-900 dark:text-white">
          That page is not built yet
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-500 dark:text-ink-400">
          Phase 1 includes the landing page, auth and the student dashboard. Everything else lands
          in the next phase.
        </p>
        <a href="/dashboard" className="btn-primary mt-5">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/interview"
        element={
          <RequireAuth>
            <Interview />
          </RequireAuth>
        }
      />
      <Route
        path="/interview/report/:id"
        element={
          <RequireAuth>
            <InterviewReport />
          </RequireAuth>
        }
      />
      <Route
        path="/practice"
        element={
          <RequireAuth>
            <Practice />
          </RequireAuth>
        }
      />
      <Route
        path="/questions"
        element={
          <RequireAuth>
            <Questions />
          </RequireAuth>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <RequireAuth>
            <Bookmarks />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Admin />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
