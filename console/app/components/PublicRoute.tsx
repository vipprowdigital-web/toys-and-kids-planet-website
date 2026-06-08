import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "~/utils/auth";

interface PublicRouteProps {
  children: React.ReactNode;
}

// Redirect logged-in users away from sign-in / sign-up pages
export function PublicRoute({ children }: PublicRouteProps) {
  if (typeof window !== "undefined" && isAuthenticated()) {
    return <Navigate to="/admin/blog" replace />;
  }
  return <>{children}</>;
}
