import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "~/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protech routes that require login
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
