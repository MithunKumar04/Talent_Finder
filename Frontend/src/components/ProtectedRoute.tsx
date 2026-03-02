import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
