import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy loading des pages pour optimiser les performances
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TendersPage = lazy(() => import('./pages/TendersPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const EvaluatorDashboardPage = lazy(() => import('./pages/EvaluatorDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const SuperAdminDashboardPage = lazy(() => import('./pages/SuperAdminDashboardPage'));
const SupplierDashboardPhase1Page = lazy(() => import('./pages/SupplierDashboardPhase1Page'));
const SupplierDashboardPhase2Page = lazy(() => import('./pages/SupplierDashboardPhase2Page'));

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-cameg-gray">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cameg-blue"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-cameg-gray">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/tenders" element={<TendersPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/evaluator-dashboard" element={<EvaluatorDashboardPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/supplier-dashboard-phase1" element={<SupplierDashboardPhase1Page />} />
            <Route path="/supplier-dashboard-phase2" element={<SupplierDashboardPhase2Page />} />
            {/* All routes configured */}
              </Routes>
            </Suspense>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1A1A1A',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 25px -5px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
