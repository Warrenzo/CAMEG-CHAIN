import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/common/ProtectedRoute';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Rediriger vers le bon dashboard selon le rôle
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'superadmin':
          navigate('/super-admin-dashboard');
          break;
        case 'evaluator':
          navigate('/evaluator-dashboard');
          break;
        case 'supplier':
          navigate('/supplier-dashboard-phase1');
          break;
        default:
          navigate('/admin-dashboard'); // Par défaut, rediriger vers admin
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Afficher un spinner pendant la redirection
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen bg-cameg-gray">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
