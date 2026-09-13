import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/auth';
import { AppLayout } from './components/layout/layout';
import { Login, Register } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Projects, ProjectDetail } from './pages/projects/projects';
import { Assessments, AssessmentDetail } from './pages/assessments/assessments';
import { Findings, FindingDetail } from './pages/findings/findings';
import { Reports, Settings } from './pages/reports/reports';
import { Landing } from './pages/landing/Landing';
import { ApiTester } from './pages/tools/ApiTester';
import { Activity } from './pages/activity/Activity';
import { Help } from './pages/help/Help';

import { ToastProvider } from './context/ToastContext';
import { SakshamBot } from './components/chat/SakshamBot';

const qc = new QueryClient();

function Protected() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-8 text-sm text-slate-500">Loading session…</p>;
  // Remember where the refresh/login interruption happened so auth can send
  // the user straight back to the same page afterwards.
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname + location.search }} />;
  return <AppLayout><Outlet /></AppLayout>;
}

// Logged-in users never see auth pages (also stops Google One Tap re-firing post-login).
function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-sm text-slate-500">Loading session…</p>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<PublicOnly />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
              </Route>
              <Route element={<Protected />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessments/:id" element={<AssessmentDetail />} />
                <Route path="/findings" element={<Findings />} />
                <Route path="/findings/:id" element={<FindingDetail />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/api-tester" element={<ApiTester />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/help" element={<Help />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/targets" element={<Navigate to="/projects" replace />} />
              </Route>
              <Route path="*" element={<p className="p-8">Not found — <a className="underline" href="/dashboard">dashboard</a></p>} />
            </Routes>
            <SakshamBot />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
