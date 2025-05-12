import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PublicRoute() {
  const { isAuthenticated } = useSelector((state) => state.user);
  
  // If already authenticated, redirect to home/dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, render the public content
  return <Outlet />;
}

export default PublicRoute;