import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function ProtectedAdminRoute() {
  const { isAuthenticated, isCheckingAuth } = useAdminAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <p className="text-white/70">Checking admin session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
