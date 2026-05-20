import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ('admin' | 'sales')[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading, initializing } = useAppSelector(
    (state) => state.auth
  );

  if (initializing || loading) {
    return <LoadingSpinner label="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
