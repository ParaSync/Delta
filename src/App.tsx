import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { MainLayout } from '@/components/layout/main-layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Forms from './pages/Forms';
import FormBuilder from './pages/FormBuilder';
import Responses from './pages/Responses';
import Users from './pages/Users';
import NotFoundPage from './pages/NotFoundPage';
import SignUp from './pages/SignUp';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            {/* Protected routes with layout */}
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />

            <Route
              path="/forms"
              element={
                <MainLayout>
                  <Forms />
                </MainLayout>
              }
            />

            <Route path="/forms/new" element={<FormBuilder />} />
            <Route path="/forms/edit/:formId" element={<FormBuilder />} />

            <Route
              path="/responses"
              element={
                <MainLayout>
                  <Responses />
                </MainLayout>
              }
            />

            <Route
              path="/users"
              element={
                <MainLayout>
                  <Users />
                </MainLayout>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
