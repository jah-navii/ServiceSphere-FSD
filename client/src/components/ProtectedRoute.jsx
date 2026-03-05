import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ 
  children, 
  redirectTo = "/login", 
  allowedRoles = [], 
  requireAdministrator = false,
  requireModerator = false
}) => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.user);

  // Check localStorage for moderator authentication (moderators don't use Redux)
  const localUser = localStorage.getItem('user');
  const localToken = localStorage.getItem('token');
  
  // Moderator authentication check
  if (requireModerator) {
    if (!localToken || !localUser) {
      return <Navigate to="/login/moderator" replace />;
    }
    try {
      const parsedUser = JSON.parse(localUser);
      if (parsedUser.role !== 'moderator') {
        return <Navigate to="/unauthorized" replace />;
      }
      return children;
    } catch (err) {
      return <Navigate to="/login/moderator" replace />;
    }
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if administrator role is required
  if (requireAdministrator) {
    if (currentUser?.role !== 'administrator') {
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  }

  // If roles are specified and user role doesn't match, redirect to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
