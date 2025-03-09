import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/Context';

const ProtectedRoute = ({ children }) => {
  const { isAdminLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAdminLoggedIn) {
    // Redirect to login while saving the attempted URL
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 