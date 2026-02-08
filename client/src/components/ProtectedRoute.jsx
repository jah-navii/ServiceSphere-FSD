import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, redirectTo = "/login", allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.user);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If roles are specified and user role doesn't match, redirect to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
