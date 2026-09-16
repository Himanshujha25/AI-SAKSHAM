import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/auth';
import { AppLayout } from './components/layout/layout';
import { PageSkeleton, AuthSkeleton } from './components/shared/shared';
import { OfflineBanner } from './components/shared/OfflineBanner';
import { ToastProvider } from './context/ToastContext';
import { SakshamBot } from './components/chat/SakshamBot';
import { Login, Register } from './pages/auth/auth';

// Dynamic Route Code Splitting for remaining pages
const Landing = lazy(() => import('./pages/landing/Landing').then((m) => ({ default: m.Landing })));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Projects = lazy(() => import('./pages/projects/projects').then((m) => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import('./pages/projects/projects').then((m) => ({ default: m.ProjectDetail })));
const Assessments = lazy(() => import('./pages/assessments/assessments').then((m) => ({ default: m.Assessments })));
const AssessmentDetail = lazy(() => import('./pages/assessments/assessments').then((m) => ({ default: m.AssessmentDetail })));
const Findings = lazy(() => import('./pages/findings/findings').then((m) => ({ default: m.Findings })));
const FindingDetail = lazy(() => import('./pages/findings/findings').then((m) => ({ default: m.FindingDetail })));
const Reports = lazy(() => import('./pages/reports/reports').then((m) => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/reports/reports').then((m) => ({ default: m.Settings })));
const ApiTester = lazy(() => import('./pages/tools/ApiTester').then((m) => ({ default: m.ApiTester })));
const Activity = lazy(() => import('./pages/activity/Activity').then((m) => ({ default: m.Activity })));
const Help = lazy(() => import('./pages/help/Help').then((m) => ({ default: m.Help })));

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Protected() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6 max-w-7xl mx-auto"><PageSkeleton title="Verifying security credentials..." /></div>;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname + location.search }} />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function PublicOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isRegister = location.pathname.includes('register');
  if (loading) return <AuthSkeleton mode={isRegister ? 'register' : 'login'} />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <OfflineBanner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<div className="p-6 max-w-7xl mx-auto"><PageSkeleton /></div>}>
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
                <Route path="*" element={<p className="p-8">Not found — <a className="underline text-cyan-400" href="/dashboard">Return to Dashboard</a></p>} />
              </Routes>
            </Suspense>
            <SakshamBot />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
